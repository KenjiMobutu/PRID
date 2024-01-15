import { Component, OnInit, ViewChild,Input, SimpleChanges } from '@angular/core';
import { Attempt, Quiz, QuizStatus } from '../../models/quiz';
import { QuizService } from 'src/app/services/quiz.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash-es';
import { Question } from '../../models/quiz';
import { QuestionService } from 'src/app/services/question.service';
import { Solution } from 'src/app/models/solution';
import { SolutionService } from 'src/app/services/solution.service';
import { CodeEditorComponent } from '../code-editor/code-editor.component';
import { AnswerService } from 'src/app/services/answer.service';
import { da, el, tr } from 'date-fns/locale';
import { AttemptService } from 'src/app/services/attempt.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'oidc-client';
import { Data } from 'popper.js';
import { DataBase } from 'src/app/models/database';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})

export class QuestionComponent implements OnInit{
  @ViewChild('editor') editor!: CodeEditorComponent;

  question: Question | null | undefined;
  questions: Question[] = [];
  quiz: Quiz | null = null;
  solutions: Solution[] = [];
  solution: Solution | null | undefined;
  showSolutions: boolean = false;
  showAnswers: boolean = false;
  showRowsCount: boolean = false;
  rowsCount: number = 0;
  currentQuestionId: number | null = null;
  currentQuestionIndex: number = 0;
  isSolutionCorrect: boolean | null = null;
  private _isTest?: boolean;
  isQuizTest = false;
  isAnswerd = false;
  query = "";
  now = new Date();
  heure = this.now;
  date = this.now;
  //horodatage = `${this.date}`;
  horodatage = new Date();
  answerMessage : string ="";
  res : boolean = false;
  showAnswerTable: boolean = false;
  columnNames: string[] = []; // Initialisation noms de colonnes
  dataRows: string[][] = []; // Initialisation des lignes de données
  isQuizFinished = false;
  isTestEncours = false;
  isQuizClosed = false;
  user : number | undefined;
  database: string = "";
  DB!: DataBase;
  dataT: any;
  errors: any;
  badQuery!: boolean;
  correctMessage: string = "";
  correctQuery: boolean = false;
  havePrevious: boolean = true;
  haveNext: boolean = true;
  public haveAttempt: boolean = false;
  public databases: DataBase[] = [];
  public attempts: Attempt [] = [];
  public lastAttempt: Attempt | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: QuestionService,
    private quizService: QuizService,
    private solutionService: SolutionService,
    private answerService: AnswerService,
    private attemptService: AttemptService,
    private authService: AuthenticationService,
    private questionService: QuestionService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef

    ) { }

    ngOnInit() {
      this.quizService.getAllDatabase().subscribe(databases => {
        this.databases = databases;
        console.log('--> Databases:', this.databases);
      });
      const db = this.databases.find(db => db.id === this.quiz!.databaseId);
      this.database = db!.name ?? '';

    }

    ngAfterViewInit(): void {
      this.editor.focus();
      this.user = this.authService.currentUser?.id;
      this.route.params.subscribe(params => {
        const questionId = +params['id'];
        // l'ID de la question actuelle
        this.currentQuestionId = questionId;
        this.service.getById(questionId).subscribe(question => {
          this.question = question;
          this.questionInit(this.question);
          console.log('!!$!$!$!$!$$!  Question:', this.question);
        });
      });
    }

    questionInit(question: Question) {
      const quizId = question?.quizId ?? 0;
      this.quizService.getAllDatabase().subscribe(databases => {
        this.databases = databases;
        console.log('--> Databases:', this.databases);
      });
        this.quizService.getOne(quizId).subscribe(quiz => {
          this.quiz = quiz;
          const db = this.databases.find(db => db.id === quiz!.databaseId);
          console.log('---> Database INIT!!:', db);
          this.DB = db!;
          this.database = db!.name ?? '';
          this._isTest = this.quiz?.isTest;
          console.log('---> Quiz!!:', this.quiz);
          if(quiz?.isTest){
            this.isQuizTest = true;
            this.quizService.getTestByUserAndQuiz(this.user!, quizId).subscribe(q => {
              console.log('---> getTestByUserAndQuiz TEST:', q);
              //this.isQuizFinished = q?.status === QuizStatus.Fini;
              this.isTestEncours = q?.status === QuizStatus.EnCours;
              console.log('---> Quiz STATUS FINISHED 1:', this.isQuizFinished );
              console.log('---> Quiz STATUS EN COURS:', this.isTestEncours );
            });
          }
          this.isQuizClosed = this.quiz?.isClosed!;
          console.log('---> Quiz STATUS CLOSED:', this.isQuizClosed );
          console.log('---> Quiz STATUS FINISHED 2:', this.isQuizFinished );
          console.log('---> Database NAME!!:', db!.name);
          this.questions = quiz?.questions || [];
          console.log('---->  Questions:', this.questions);
          this.solutionService.getByQuestionId(question?.id ?? 0).subscribe(solutions => {
            this.solutions = solutions;
            this.solution = this.solutions.find(s => s.questionId === this.currentQuestionId );
            console.log('$$---->  currentQuestionId:', this.currentQuestionId );
            console.log('***---->  Solution:', this.solution);
            this.questions[this.currentQuestionIndex].solutions = this.solutions;
            console.log('--->  Solutions:', this.solutions);
          });
        });
        this.getAnswerForCurrentQuestion(quizId);
        this.cdr.detectChanges();
    }

    next() {
      const nextQuestionIndex = this.questions.findIndex(q => q.id === this.currentQuestionId) + 1;
      this.haveNext = nextQuestionIndex < this.questions.length;

      if (this.haveNext) {
        this.resetAnswerState();
        this.currentQuestionIndex = nextQuestionIndex;
        const nextQuestionId = this.questions[nextQuestionIndex].id;
        this.currentQuestionId = nextQuestionId!;
        this.questionInit(this.questions[nextQuestionIndex]);
        this.getAnswerForCurrentQuestion(this.quiz!.id!);
        this.router.navigate(['/question', nextQuestionId]).then(() => {
          this.updateButtonState();
        });
      } else {
        console.log('Il n\'y a pas de question suivante.');
      }
    }

    previous() {
      const previousQuestionIndex = this.questions.findIndex(q => q.id === this.currentQuestionId) - 1;
      this.havePrevious = previousQuestionIndex >= 0;

      if (this.havePrevious) {
        this.resetAnswerState();
        this.currentQuestionIndex = previousQuestionIndex;
        const previousQuestionId = this.questions[previousQuestionIndex].id;
        this.currentQuestionId = previousQuestionId!;
        this.questionInit(this.questions[previousQuestionIndex]);
        this.getAnswerForCurrentQuestion(this.quiz!.id!);
        this.router.navigate(['/question', previousQuestionId]).then(() => {
          this.updateButtonState();
        });
      } else {
        console.log('Il n\'y a pas de question précédente.');
      }
    }

    // Mise à jour de l'état des boutons
    updateButtonState() {
      const currentIndex = this.questions.findIndex(q => q.id === this.currentQuestionId);
      this.haveNext = currentIndex < this.questions.length - 1;
      this.havePrevious = currentIndex > 0;
    }

    close() {
      console.log('Clôture du quiz');
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Clôture du quiz',
          message: 'Voulez-vous vraiment clôturer le quiz?'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // L'utilisateur a confirmé la clôture du quiz
          if (this.question?.quizId) {
            this.closeAttempt();

            // Clôturez le quiz côté front-end
            this.quiz!.attempts[this.quiz!.attempts.length - 1].finish = new Date();

            // Mettez à jour l'attempt côté front-end
            this.attemptService.update(this.quiz!.attempts[this.quiz!.attempts.length - 1].id!).subscribe(res => {
              console.log('----> *1* Résultat:', res);

              // Redirigez vers la page quiz
              this.router.navigate(['/quiz']);
            });
          }
        } else {
          // L'utilisateur a annulé l'action
          console.log('Clôture du quiz annulée');
        }
      });
    }

    get isTest(): boolean | undefined {
      return this._isTest;
    }

    @Input() set isTest(value: boolean | undefined) {
      this._isTest = value;
    }

    showSolution(){
      console.log('----> Solution:', this.solutions);
      this.showSolutions = !this.showSolutions;
      this.showAnswers = false;
      this.showAnswerTable = false;
      this.showRowsCount = false;
    }

    clear() {
      this.resetAnswerState();
    }

    send(){
      this.showSolutions = false;
      this.envoyer();
      this.sendAnswer();
    }

    newAttempt(quiz: Quiz){
      this.attemptService.add(quiz?.id!, this.user!).subscribe(
        res => {
          console.log('----> *1* Résultat:', res);
          //console.log('----> *1* Database:', this.quiz?.database.name);
          console.log('----> *1* Attempt:', this.attemptService);
        }
      );
    }

    closeAttempt() {
      this.attemptService.getByQuizIdAndUserId(this.quiz?.id ?? 0, this.user!).subscribe(attempts => {
        this.quiz!.attempts[attempts.length - 1].finish = new Date();
        if (attempts && attempts.length > 0) {
          const lastAttempt = attempts[attempts.length - 1]; // Accéder à la dernière tentative
          if (lastAttempt && lastAttempt.id !== undefined) {
            console.log('----> *** Attempt:', lastAttempt);
            lastAttempt.finish =  new Date();
            this.attemptService.update(lastAttempt.id).subscribe(res => {
              console.log('----> *1* Résultat:', res);
            });
          }
        }
      });
    }

    sendAnswer() {
      this.quizService.getOne(this.question?.quizId ?? 0).subscribe(quiz => {
        if (this.database !== undefined) {
          this.answerService.postQuery(this.question?.id ?? 0, this.query,this.database).subscribe(res => {
            console.log('----> *2* ID:', this.question?.id);
            console.log('----> *2* Query:', this.query);
            console.log('----> ** Résultat:', res);
            console.log('----> *sendAnswer* Database:', this.database);
            this.res = res;
            if (this.question?.id !== undefined && quiz?.attempts[0]?.id !== undefined) {
              var attempt = quiz?.attempts?.[quiz?.attempts.length -1];
              if(attempt?.id !== undefined)
                this.answerService.sendAnswer(this.question.id, attempt.id, this.query, res).subscribe(res => {
                    console.log('----> *3* Résultat:', res);
                });
            }
          });
        }
      });
    }

    envoyer() {
      console.log('----> *envoyer* HORODATAGE:', this.horodatage);
      console.log('----> *envoyer* Database:', this.database);
        this.questionService.postQuery(this.question!.id!, this.query, this.database!).subscribe(
          (data:any) => {
            if(this.query === "")
              this.answerMessage = `Vous n'avez pas entré de requête SQL!`;
            this.errors = data.error;
            if(this.errors.length >0){
              this.res = false;
              this.badQuery = true;
              this.answerMessage = "Erreur : \n" +  data.error;
            }
            if(data.correctMessage){
              this.res = true;
              this.answerMessage = data.correctMessage;
              this.correctQuery = true;
            }
            this.showAnswer();
            //this.showRowsCount = !this.showRowsCount;
            this.showAnswerTable = true;
            this.horodatage = new Date();
            this.rowsCount = data.data.length;
            this.dataT = data;
            this.dataRows =  data.data;
            this.columnNames = data.columnNames;
            console.log('----> *envoyer* DATA:', data);
            console.log('----> *envoyer* Errors:', this.errors);
            console.log('----> *envoyer* BadQuery:', this.badQuery);
            console.log('----> *envoyer* CorrectMessage:', data.correctMessage);
            console.log('----> *envoyer* RowsCount:', this.rowsCount);
            console.log('----> *envoyer* Rows:', this.dataRows);
            console.log('----> *envoyer* Columns:', this.columnNames);
            //console.log('----> *envoyer* HORODATAGE:', this.horodatage);
            this.showSolutions = true;
          }
        );
        this.updateHorodatage(this.quiz!.id!);
    }

    showAnswer(){
      //this.resetAnswerState();
      this.showRowsCount = true;
      this.showAnswers = true;
    }

    showTable(){
      this.showAnswerTable = !this.showAnswerTable;
      this.quizService.getOne(this.question?.quizId ?? 0).subscribe(quiz => {
        if (quiz?.database.name !== undefined) {
          //récupère les noms de colonnes
          this.answerService.getColumnNames(this.query,quiz?.database.name).subscribe(columnNames => {
            this.columnNames = columnNames;
          });
          //récupère les lignes de données
          this.answerService.getDataRows(this.query,quiz?.database.name).subscribe(dataRows => {
            this.dataRows = dataRows;
          });
        }
      });
    }

    //affiche le nombre de lignes
    showRowCount(){
      this.showRowsCount = !this.showRowsCount;
      this.quizService.getOne(this.question?.quizId ?? 0).subscribe(quiz => {
        if (quiz?.database.name !== undefined) {
          this.answerService.getDataRows(this.query,quiz?.database.name).subscribe(dataRows => {
            this.dataRows = dataRows;
            this.rowsCount = this.dataRows.length;
            console.log('----> Nombre de lignes:', this.rowsCount);
          });
        }
      });
    }

    resetAnswerState() {
      this.query = '';
      this.answerMessage = '';
      this.showSolutions = false;
      this.showAnswers = false;
      this.showAnswerTable = false;
      this.showRowsCount = false;
    }

    getAnswerForCurrentQuestion(quizId: number) {
      this.attemptService.getByQuizIdAndUserId(quizId, this.user!).subscribe(attempts => {
        console.log('----> 1 Attempts:', attempts);
        if (attempts) {
          this.attempts = attempts; // Accéder à la dernière tentative
          const lastAttempt = attempts[attempts.length - 1];
          this.lastAttempt = lastAttempt;
          if(lastAttempt.finish !== null)
            this.isQuizFinished = true;
          this.answerService.getByAttemptAndQuestionId(lastAttempt.id!, this.currentQuestionId!).subscribe(answers => {
            if (answers && answers.length > 0) {
              var lastAnswer = answers[answers.length - 1];
              if(lastAnswer)
                this.isAnswerd = true;
              console.log('----> 111 LastAnswer:', lastAnswer.sql);
              this.query = lastAnswer.sql ?? '';
              this.horodatage = lastAnswer.timestamp!;
              console.log('----> 111 Answer:', lastAnswer.timestamp);
              console.log('----> 111 Answers:', answers);
              this.envoyer();
            }
          });
        }
      });
    }

    updateHorodatage(quizId: number){
      this.attemptService.getByQuizIdAndUserId(quizId, this.user!).subscribe(attempts => {
        console.log('----> 1 Attempts:', attempts);
        if (attempts) {
          const lastAttempt = attempts[attempts.length - 1];
          this.answerService.getByAttemptAndQuestionId(lastAttempt.id!, this.currentQuestionId!).subscribe(answers => {
            if (answers && answers.length > 0) {
              var lastAnswer = answers[answers.length - 1];
              this.horodatage = lastAnswer.timestamp!;
            }
          });
        }
      });
    }

}

