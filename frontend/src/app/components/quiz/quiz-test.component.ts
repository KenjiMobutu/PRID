import { Component, OnInit, ViewChild,AfterViewInit, ElementRef, OnDestroy, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Quiz, Question, Attempt } from '../../models/quiz';
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
import { QuestionService } from 'src/app/services/question.service';
import { th } from 'date-fns/locale';
import { AnswerService } from 'src/app/services/answer.service';
import { AttemptService } from 'src/app/services/attempt.service';
import { forkJoin, tap } from 'rxjs';
import { DataBase } from 'src/app/models/database';

@Component({
  selector: 'quiz-test',
  templateUrl: './quiz-test.component.html',
  styleUrls: ['./quiz-test.component.css']
})

export class QuizTestComponent implements OnInit, AfterViewInit {
  displayedColumnsWithDates: string[] = ['nom', 'dataBase', 'startDate', 'endDate', 'statut','evaluation' , 'actions'];
  displayedColumns: string[] = ['nom', 'dataBase','statut','actions'];
  dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();
  evaluation: string = "N/A";
  answerCount: number = 0;
  private user : number | undefined;
  quiz?: Quiz;
  databaseName?: string;
  public databases: DataBase[] = [];
  evaluations: string[] = [];

  private _isTest?: boolean;
  public haveAttempt: boolean = false;
  questions: Question[] = [];
  state: MatTableState;
  private _filter?: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private quizService: QuizService,
    private stateService: StateService,
    private authService: AuthenticationService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private service: QuestionService,
    private answerService: AnswerService,
    private attemptService: AttemptService,

  ) {
    this.state = this.stateService.quizTestListState;
  }

  ngOnInit(): void {
    this.user = this.authService.currentUser?.id;
    this.columsInit();
    this.quizService.getAllDatabase().subscribe(databases => {
      this.databases = databases;
      console.log('--> Databases:', this.databases);
    });
  }

  ngAfterViewInit(): void {
    this.user = this.authService.currentUser?.id;
    this.paginatorInit();

    //console.log('----> Database:', this.quiz?.database.id);
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'databaseName': return item.database?.name;
        default: return item[property];
      }
    };

    //this.refresh();
  }

  // appelée quand on clique sur le bouton "edit"
  edit(quiz: Quiz) {
    const quizId = quiz.id ?? 0; // Si quiz.id est undefined, utilisez 0 à la place
    this.service.getQuestionsByQuizId(quizId).subscribe(questions => {
      if (questions && questions.length > 0) {
        this.questions = questions;
        const firstQuestionId = questions[0].id ?? 0; // Si questions[0].id est undefined, utilisez 0 à la place
        this.router.navigate(['/question/', firstQuestionId]);
      }
    });
  }

  review(quiz: Quiz) {
    const quizId = quiz.id ?? 0; // Si quiz.id est undefined, utilisez 0 à la place
    this.service.getQuestionsByQuizId(quizId).subscribe(questions => {
      if (questions && questions.length > 0) {
        this.questions = questions;
        const firstQuestionId = questions[0].id ?? 0; // Si questions[0].id est undefined, utilisez 0 à la place
        this.router.navigate(['/question/', firstQuestionId]);
      }
    });
  }

  startQuiz(quiz: Quiz) {
    this.newAttempt(quiz);
    const quizId = quiz.id ?? 0; // Si quiz.id est undefined, utilisez 0 à la place
    console.log('^^^^----> Quiz ID:', quizId);
    this.quizService.openQuiz(quizId).subscribe(() => {
      if (quiz) {
        quiz.isClosed = false;
        quiz.status = 0; // Assurez-vous d'avoir une énumération ou une constante pour QuizStatus.Fini
        console.log('----> Quiz STATUS:', quiz.isClosed);
      }
      this.service.getQuestionsByQuizId(quizId).subscribe(questions => {
        if (questions && questions.length > 0) {
          this.questions = questions;
          const firstQuestionId = questions[0].id ?? 0; // Si questions[0].id est undefined, utilisez 0 à la place
          this.router.navigate(['/question/', firstQuestionId]);
        }
      });
    });
  }

  newAttempt(quiz: Quiz){
    this.attemptService.add(quiz?.id!, this.user!).subscribe(
      res => {
        console.log('----> *1* Résultat:', res);
        //console.log('----> *1* Database:', this.quiz?.database.name);
        console.log('----> *1* Attempt:', res);
      }
    );
  }

  refresh() {
    const updateDatabaseName = (quiz: Quiz) => {
      const dbName = this.databases.find(db => db.id === quiz.databaseId)?.name;
      quiz.databaseName = dbName;
     //this.databaseName = dbName;
    };

    if (!this._isTest) {
      this.quizService.getTp(this.user!).subscribe(quizes => {
        this.dataSource.data = quizes;
        this.state.restoreState(this.dataSource);
        this._filter = this.state.filter;
        quizes.forEach(quiz => {
          updateDatabaseName(quiz);
          console.log('--> quiz', quiz.name + ' Database -->' + quiz.databaseName + ' Status -->' + quiz.statusAsString);
        });
      });
    } else {
      this.quizService.getTest(this.user!).subscribe(quizes => {
        this.dataSource.data = quizes;
        this.state.restoreState(this.dataSource);
        this._filter = this.state.filter;
        quizes.forEach(quiz => {
          if (this.quiz) {
            this.quiz.score = quiz.score;
          }
          updateDatabaseName(quiz);
          console.log('----> quiz', quiz.name + ' Database -->' + quiz.databaseName + ' Status -->' + quiz.statusAsString + ' ' + quiz.score);
        });
      });
    }
  }


  paginatorInit(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: Quiz, filter: string) => {
      const str = data.name + ' ' + data.database?.name + ' ' + data.statusAsString + ' ';
      console.log('---> Database', data.database);
      console.log('---> str', str);
      return str.toLowerCase().includes(filter.toLowerCase());
    };

    this.state.bind(this.dataSource);
    // récupère les données
    this.refresh();
  }

  columsInit(){
    if (this._isTest) {
      this.displayedColumns = [...this.displayedColumnsWithDates];
    }
  }

  get isTest(): boolean | undefined {
    return this._isTest;
  }

  @Input() set isTest(value: boolean | undefined) {
    this._isTest = value;
  }

  //FILTRE
  get filter(): string | undefined {
    return this._filter;
  }

  @Input() set filter(value: string | undefined) {
    this._filter = value;
    this.load('setter');
  }

  load(from: string):void{
    this.dataSource.filter = this._filter??"";
    console.log('---> load', this._filter);
  }

}
