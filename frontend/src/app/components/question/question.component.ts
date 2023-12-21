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
import { da, tr } from 'date-fns/locale';
import { AttemptService } from 'src/app/services/attempt.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'oidc-client';
import { Data } from 'popper.js';
import { DataBase } from 'src/app/models/database';
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
  query = "";
  now = new Date();
  heure = this.now.toLocaleTimeString();
  date = this.now.toLocaleDateString();
  horodatage = `${this.date} ${this.heure}`;
  answerMessage : string ="";
  res : boolean = false;
  showAnswerTable: boolean = false;
  columnNames: string[] = []; // Initialisation noms de colonnes
  dataRows: string[][] = []; // Initialisation des lignes de données
  isQuizFinished = false;
  user : number | undefined;
  database: string = "";
  DB!: DataBase;
  dataT: any;
  errors: any;
  badQuery!: boolean;
  correctMessage: string = "";
  correctQuery: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: QuestionService,
    private quizService: QuizService,
    private solutionService: SolutionService,
    private answerService: AnswerService,
    private attemptService: AttemptService,
    private authService: AuthenticationService,
    private questionService: QuestionService

    ) { }

    ngOnInit() {
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

    ngAfterViewInit(): void {
      this.editor.focus();
    }

    questionInit(question: Question) {
        const quizId = question?.quizId ?? 0;
        this.quizService.getOne(quizId).subscribe(quiz => {
          this.quiz = quiz;
          this.DB = this.quiz!.database;
          this.database = quiz?.database.name ?? '';
          this._isTest = this.quiz?.isTest;
          console.log('---> Quiz!!:', this.quiz);
          this.isQuizFinished = this.quiz?.status === QuizStatus.Fini;
          console.log('---> Quiz STATUS FINISHED:', this.isQuizFinished );
          console.log('---> Database NAME!!:', this.quiz?.database.name);
          this.questions = quiz?.questions || [];
          console.log('---->  Questions:', this.questions);
          this.solutionService.getByQuestionId(question?.id ?? 0).subscribe(solutions => {
            this.solutions = solutions;
            this.solution = this.solutions.find(s => s.questionId === this.currentQuestionId );
            console.log('$$---->  currentQuestionId:', this.currentQuestionId );
            console.log('***---->  Solution:', this.solution);
            this.query = this.solutions[0].sql ?? '';
            this.questions[this.currentQuestionIndex].solutions = this.solutions;
            console.log('--->  Solutions:', this.solutions);
          });
        });
    }

    next() {
      this.showAnswers = false;
      this.showAnswerTable = false;
      this.showRowsCount = false;
      // Vérifier si l'ID de la question actuelle est dans la liste des questions
      console.log('----> currentQuestionIndex:', this.currentQuestionIndex);
      const nextQuestionIndex = this.questions.findIndex(q => q.id === this.currentQuestionId) + 1;
      console.log('----> nextQuestionIndex:', nextQuestionIndex);
      if (nextQuestionIndex < this.questions.length) {
        this.showSolutions = false;
        this.currentQuestionIndex = nextQuestionIndex;
        const nextQuestionId = this.questions[nextQuestionIndex].id;
        this.router.navigate(['/question', nextQuestionId]);
      } else {
        console.log('Il n\'y a pas de question suivante.');
      }
    }

    previous() {
      this.showAnswers = false;
      this.showAnswerTable = false;
      this.showRowsCount = false;
      // Vérifier si l'ID de la question actuelle est dans la liste des questions
      console.log("----> currentQuestionId:",this.currentQuestionId )
      console.log('----> currentQuestionIndex:', this.currentQuestionIndex);
      const previousQuestionIndex = this.questions.findIndex(q => q.id === this.currentQuestionId) - 1;
      console.log('----> previousQuestionIndex:', previousQuestionIndex);
      if (previousQuestionIndex >= 0) {
        this.showSolutions = false;
        this.currentQuestionIndex = previousQuestionIndex;
        const previousQuestionId = this.questions[previousQuestionIndex].id;
        this.router.navigate(['/question', previousQuestionId]);
      } else {
        console.log('Il n\'y a pas de question précédente.');
      }
    }

    close() {
      console.log('Clôture du quiz');
      if (this.question?.quizId) {
        this.quizService.closeQuiz(this.question.quizId).subscribe(() => {
          if (this.quiz) {
            this.quiz.isClosed = true;
            this.quiz.status = 1; // Assurez-vous d'avoir une énumération ou une constante pour QuizStatus.Fini
            console.log('----> Quiz STATUS:', this.quiz.isClosed);
            this.router.navigate(['/quiz']);
          }
        }, error => {
          console.error('Erreur lors de la clôture du quiz:', error);
        });
      }
      this.closeAttempt();
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
    }

    clear() {
      this.query = ''; // Efface le contenu du textarea
      this.answerMessage = '';
      this.horodatage = '';
      this.showSolutions = false;
      this.showAnswerTable = false;
      this.showRowsCount = false;
    }

    send(){
      //this.newAttempt(this.quiz!);
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
      this.attemptService.getByQuizId(this.quiz?.id ?? 0).subscribe(attempts => {
        if (attempts && attempts.length > 0) {
          const lastAttempt = attempts[attempts.length - 1]; // Accéder à la dernière tentative
          if (lastAttempt && lastAttempt.id !== undefined) {
            this.attemptService.update(lastAttempt.id).subscribe(res => {
              console.log('----> *1* Résultat:', res);
            });
          }
        }
      });
    }

    sendAnswer() {
      //this.newAttempt(this.quiz!);
      //this.showAnswer();
      //this.showSolutions = false;
      this.quizService.getOne(this.question?.quizId ?? 0).subscribe(quiz => {
        if (quiz?.database.name !== undefined) {
          this.answerService.postQuery(this.question?.id ?? 0, this.query,quiz?.database.name).subscribe(res => {
          console.log('----> *2* ID:', this.question?.id);
          console.log('----> *2* Query:', this.query);
          console.log('----> ** Résultat:', res);
          console.log('----> *sendAnswer* Database:', quiz?.database.name);
          this.res = res;
          if (this.question?.id !== undefined && quiz?.attempts[0]?.id !== undefined) {
            var attempt = quiz?.attempts?.[quiz?.attempts.length -1];
            if(attempt?.id !== undefined)
              this.answerService.sendAnswer(this.question.id, attempt.id, this.query, res).subscribe(res => {
                  console.log('----> *3* Résultat:', res);
              });
          }
          // if(this.query === ""){
          //   this.answerMessage = `Vous n'avez pas entré de requête SQL!`;
          // }else{
          //   if ( res === true) {
          //     console.log('----> ** Message texte:', res);
          //     this.answerMessage = `Votre requête a retourné une réponse correcte!\n
          //     Néanmoins, comparez votre solution avec celle(s) ci-dessous pour voir si vous n'avez pas eu un peu de chance... ;)`;
          //     this.showSolutions = true;
          //     this.showTable();
          //     this.showRowCount();
          //   }else{
          //     console.log('----> ** Message texte:', res);
          //     this.answerMessage = `Votre requête n'a pas retourné de réponse correcte!`;
          //   }
          // }
        });
        }
      });

      //this.answerMessage ="";
      //this.showSolutions = false;
    }

    envoyer() {
      this.showAnswer();
        this.questionService.postQuery(this.question!.id!, this.query,this.database!).subscribe(
          (data:any) => {
            if(this.query === "")
              this.answerMessage = `Vous n'avez pas entré de requête SQL!`;
            this.errors = data.error;
            if(this.errors.length >0){
              this.res = false;
              this.badQuery = true;
              this.answerMessage = data.error;
            }
            if(data.correctMessage){
              this.res = true;
              this.answerMessage = data.correctMessage;
              this.correctQuery = true;
            }

            this.showRowsCount = !this.showRowsCount;
            this.showAnswerTable = !this.showAnswerTable;

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
            this.showSolutions = true;
          }
        );
    }

    showAnswer(){
      this.showAnswers = !this.showAnswers;
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
}

