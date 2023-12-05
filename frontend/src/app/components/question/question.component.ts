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
import { th } from 'date-fns/locale';



@Component({
  selector: 'question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})

export class QuestionComponent implements OnInit{
  question: Question | null | undefined; // Initialiser avec une nouvelle question par défaut
  questions: Question[] = [];
  quiz: Quiz | null = null;
  currentQuestionId: number | null = null;
  currentQuestionIndex: number = 0;
  query = "SELECT *\nFROM P\nWHERE COLOR='Red'";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: QuestionService,
    private quizService: QuizService
    ) { }

    ngOnInit() {
      this.route.params.subscribe(params => {
        const questionId = +params['id'];
        // l'ID de la question actuelle
        this.currentQuestionId = questionId;
        this.service.getById(questionId).subscribe(question => {
          // Vérifiez si des questions ont été récupérées
          this.question = question || null;
          this.quizInit(this.question?.id || 0); // Obtenez l'ID du quiz correspondant
          console.log('!!$!$!$!$!$$!  Question:', this.question);
        });
      });
    }

    quizInit(quizId: number) {
        // Une fois que vous avez le quiz, vous pouvez maintenant récupérer les questions associées à ce quiz
        this.quizService.getQuizByQuestionId(quizId).subscribe(quiz => {
          this.quiz = quiz;
          console.log('!!$!$!$!$!$$!  Quiz:', this.quiz);
          this.questions = quiz.questions;
          console.log('------->  Questions:', this.questions);
        });
    }

    next() {
      // Vérifier si l'index de la question actuelle est inférieur à la longueur des questions - 1
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        console.log('----> currentQuestionIndex:', this.currentQuestionIndex);
        // Utiliser l'ID de la question suivante
        const nextQuestionId = this.questions[this.currentQuestionIndex].id;
        this.router.navigate(['/question', nextQuestionId]);
      } else {
        // Traiter le cas où il n'y a pas de question suivante
        console.log('Il n\'y a pas de question suivante.');
      }
    }

    previous() {
      // Vérifier si l'index de la question actuelle est supérieur à 0
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
        // Utiliser l'ID de la question précédente
        const previousQuestionId = this.questions[this.currentQuestionIndex].id;
        this.router.navigate(['/question', previousQuestionId]);
      } else {
        // Traiter le cas où il n'y a pas de question précédente
        console.log('Il n\'y a pas de question précédente.');
      }
    }
}

