import { Component, OnInit, ViewChild,AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
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


@Component({
  selector: 'question',
  templateUrl: './question.component.html'
})

export class QuestionComponent{
  dataSource: MatTableDataSource<Question> = new MatTableDataSource();
  displayedColumns: string[] = ['id'];
  question: Question = new Question(); // Initialiser avec une nouvelle question par défaut

  constructor(
    private route: ActivatedRoute,
    private service: QuestionService


    ) { }


  ngOnInit() {
    this.route.params.subscribe(params => {
      const questionId = +params['id']; //id de la question depuis les paramètres de l'URL
      //accéder à la question dans votre service ou où vous stockez les questions
      this.service.getById(questionId).subscribe(question => {
        this.question = question? question : new Question();
      });
    });
  }


}
