import { Component, OnInit, ViewChild,AfterViewInit, ElementRef, OnDestroy, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Quiz } from '../../models/quiz';
import { MatDialog } from '@angular/material/dialog';
import { QuizService } from 'src/app/services/quiz.service';
import { StateService } from 'src/app/services/state.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash-es';
import { Question } from '../../models/quiz';
import { QuestionService } from 'src/app/services/question.service';
import { el, th, tr } from 'date-fns/locale';
import { Solution } from 'src/app/models/solution';
import { SolutionService } from 'src/app/services/solution.service';
import { CodeEditorComponent } from '../code-editor/code-editor.component';

@Component({
  selector: 'question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})

export class QuestionComponent implements OnInit{
  @ViewChild('editor') editor!: CodeEditorComponent;

  question: Question | null | undefined; // Initialiser avec une nouvelle question par défaut
  questions: Question[] = [];
  quiz: Quiz | null = null;
  solutions: Solution[] = [];
  solution: Solution | null | undefined;
  showSolutions: boolean = false;
  showAnswers: boolean = false;
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: QuestionService,
    private quizService: QuizService,
    private solutionService: SolutionService,
    ) { }

    ngOnInit() {
      this.route.params.subscribe(params => {
        const questionId = +params['id'];
        // l'ID de la question actuelle
        this.currentQuestionId = questionId;
        this.service.getById(questionId).subscribe(question => {
          this.question = question;

          this.questionInit(this.question); // Obtenez l'ID du quiz correspondant
          console.log('!!$!$!$!$!$$!  Question:', this.question);
        });
      });
    }

    ngAfterViewInit(): void {
      this.editor.focus();
    }

    questionInit(question: Question) {
        const quizId = question?.quizId ?? 0; // Si question?.quizId est undefined, utilisez 0 à la place
        this.quizService.getOne(quizId).subscribe(quiz => {
          this.quiz = quiz;
          this._isTest = this.quiz?.isTest;
          console.log('---> Quiz:', this.quiz);
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
    }
    send(){
      this.sendAnswer();
      //this.showTable();
    }

    sendAnswer() {
      this.showAnswer();
      //this.showTable();
      this.showSolutions = false;
      this.solutionService.sendSolution(this.question?.id ?? 0, this.query).subscribe(res => {
        console.log('----> *2* ID:', this.question?.id);
        console.log('----> *2* Query:', this.query);
        console.log('----> ** Résultat:', res);
        //this.query = this.query;
        this.res = res;
        if(this.query === ""){
          this.answerMessage = `Vous n'avez pas entré de requête SQL!`;
        }else{
          if ( res === true) {
            console.log('----> ** Message texte:', res.valueOf());
            this.answerMessage = `Votre requête a retourné une réponse correcte!\n
            Néanmoins, comparez votre solution avec celle(s) ci-dessous pour voir si vous n'avez pas eu un peu de chance... ;)`;
            this.showSolutions = true;
            this.showTable();
            //this.showAnswerTable = true;
          }else{
            console.log('----> ** Message texte:', res);
            this.answerMessage = `Votre requête n'a pas retourné de réponse correcte!`;
          }
        }});
      this.answerMessage ="";
      this.showSolutions = false;
    }

    showAnswer(){
      this.showAnswers = !this.showAnswers;
    }

    showTable(){
      this.showAnswerTable = !this.showAnswerTable;
      this.solutionService.getColumnNames(this.query).subscribe(columnNames => {
        this.columnNames = columnNames;
      });

      this.solutionService.getDataRows(this.query).subscribe(dataRows => {
        this.dataRows = dataRows;
      });
    }
}

