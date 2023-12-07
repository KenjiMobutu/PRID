import { Component, OnInit, ViewChild,AfterViewInit, ElementRef, OnDestroy, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Quiz, Question } from '../../models/quiz';
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


@Component({
  selector: 'quiz-test',
  templateUrl: './quiz-test.component.html'
})

export class QuizTestComponent implements OnInit, AfterViewInit {
  displayedColumnsWithDates: string[] = ['nom', 'dataBase', 'startDate', 'endDate', 'statut','evaluation' , 'actions'];
  displayedColumns: string[] = ['nom', 'dataBase','statut','actions'];
  dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();

  private _isTest?: boolean;
  questions: Question[] = [];
  state: MatTableState;
  filter: string = '';

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
    private service: QuestionService
  ) {
    this.state = this.stateService.quizTestListState;
  }

  ngOnInit(): void {
    this.columsInit();
    this.refresh();
  }

  ngAfterViewInit(): void {
    this.paginatorInit();
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

  refresh() {
    if (!this._isTest) {
      this.quizService.getTp().subscribe(quizes => {
            // assigne toutes les données récupérées au datasource
            this.dataSource.data = quizes;
            // restaure l'état du filtre à partir du state
            this.filter = this.state.filter;
          });
    } else {
      this.quizService.getTest().subscribe(quizes => {
            // assigne toutes les données récupérées au datasource
            this.dataSource.data = quizes;
            // restaure l'état du filtre à partir du state
            this.filter = this.state.filter;
          });
    }
  }

  paginatorInit(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    if (this.sort) {
        this.state.bind(this.dataSource);
    }
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
    //this.load('setter');
  }

  get isFilter(): boolean | undefined {
    return this._isTest;
  }

  @Input() set isFilter(value: boolean | undefined) {
    this._isTest = value;
    this.dataSource.filter = value ? 'test' : 'tp';
  }

  load(from: string):void{
    this.dataSource.filter = this.filter??"";
  }
}
