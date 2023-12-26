import { Component, OnInit, ViewChild,AfterViewInit, ElementRef, OnDestroy, Input, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Quiz, Question } from '../../models/quiz';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
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
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {FloatLabelType, MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule} from '@angular/material/tree';
import {MatButtonModule} from '@angular/material/button';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import {JsonPipe} from '@angular/common';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import { TruncatePipe } from 'src/app/helpers/truncatePipe';
import { DataBase } from 'src/app/models/database';
import { SolutionService } from 'src/app/services/solution.service';
import { Solution } from 'src/app/models/solution';
@Component({
  selector: 'quiz-edition',
  templateUrl: './quiz-edition.component.html',
  styleUrls: ['./quiz-edition.component.css']
})

export class QuizEditionComponent implements OnInit, AfterViewInit{
  public isNew: boolean = false;
  public isTest?: boolean;
  public today: Date = new Date();
  range = new FormGroup({
    ctlStart: new FormControl<Date | null>(null),
    ctlEnd: new FormControl<Date | null>(null),
  });
  public frm!: FormGroup;
  public ctlName!: FormControl;
  public ctlDescription!: FormControl;
  public ctlDataBase!: FormControl;
  public ctlRadioGroup!: FormControl;
  public ctlPublished!: FormControl;
  public ctlDateRange!: FormControl;
  public ctlStart!: FormControl;
  public ctlFinish!: FormControl;
  public ctlQuestionBody!: FormControl;
  public ctlQuery!: FormControl;
  panelOpenState = false;
  public databases: DataBase[] = [];
  DB!: DataBase;
  query = "";
  quiz!: Quiz;
  questionSolutionGroups: { [questionId: number]: FormGroup[] } = {};
  questions: Question[] = [];
  solutions: Solution[] = [];
  solutionGroups: FormGroup[] = [];
  selectedDatabase: string = '';
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private quizService: QuizService,
    private solutionService: SolutionService,

  ){
    this.ctlName = this.fb.control('', [
      Validators.required,
      Validators.minLength(3),
      this.forbiddenValue('abc')
    ]);
    this.ctlDescription = this.fb.control('', []);
    this.ctlRadioGroup = this.fb.control('', []);
    this.ctlDataBase = this.fb.control('', []);
    this.ctlPublished = this.fb.control(false);
    this.ctlDateRange = this.fb.control('', []);
    this.ctlStart = this.fb.control('', [Validators.required, this.dateNotBeforeTodayValidator()]);
    this.ctlFinish = this.fb.control('', [Validators.required]);
    this.range = this.fb.group({
      ctlStart: this.ctlStart,
      ctlEnd: this.ctlFinish
    }, { validators: this.dateRangeValidator });
    this.ctlQuestionBody = this.fb.control('', [ Validators.required]);
    this.ctlQuery = this.fb.control('', []);
    this.frm = this.fb.group({
      name: this.ctlName,
      description: this.ctlDescription,
      radioGroup: this.ctlRadioGroup,
      dataBase: this.ctlDataBase,
      published: this.ctlPublished,
      dateRange: this.ctlDateRange,
      start: this.ctlStart,
      finish: this.ctlFinish,
      questionBody: this.ctlQuestionBody,
      query: this.ctlQuery,
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const quizId = +params['id'];
      this.quizEditInit(quizId);
    });
  }

  ngAfterViewInit(): void {
    this.route.params.subscribe(params => {
      const quizId = +params['id'];
      this.quizEditInit(quizId);
    });
    this.quizService.getAllDatabase().subscribe(databases => {
      this.databases = databases;
      console.log('--> Databases:', this.databases);
    });
  }

  quizEditInit(quizId: number){
    this.quizService.getOne(quizId).subscribe(quiz => {
      const now = new Date();
      this.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      this.quiz = quiz || new Quiz();
      this.isTest = quiz?.isTest;
      this.DB = quiz!.database;
      this.ctlName.setValue(quiz?.name);
      this.ctlDescription.setValue(quiz?.description);
      this.ctlRadioGroup.setValue(quiz?.isTest ? 'test' : 'trainning');
      this.ctlPublished.setValue(quiz?.isPublished);
      this.ctlDataBase.setValue(quiz?.database.name);
      this.ctlDateRange.setValue(quiz?.start);
      this.ctlStart.setValue(quiz?.start);
      this.ctlFinish.setValue(quiz?.finish);
      this.questions = quiz?.questions || [];

      console.log('--> Quiz NAME:', quiz?.name);
      console.log('--> isTest', this.isTest);
      console.log('--> RADIO:', this.ctlRadioGroup.value);
      console.log('--> Database:', quiz?.database.name);
      console.log('--> Range:', this.ctlDateRange.value);
      console.log('--> Start DATE:', this.ctlStart.value);
      console.log('--> End DATE:', this.ctlFinish.value);
      console.log('--> Quiz:', quiz);
      console.log('--> Query:', this.ctlQuery.value);
      this.questions = quiz?.questions ?? [];
      console.log('--> Questions:', this.questions);
      this.questions = this.questions.map(q => ({ ...q, isOpen: false }));
      this.quizService.getAllDatabase().subscribe(databases => {
        this.databases = databases;
        console.log('--> Databases:', this.databases);
      });
    });
  }

  getFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl || new FormControl();
  }

  dateNotBeforeTodayValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const forbidden = control.value < this.today;
      return forbidden ? { 'beforeToday': { value: control.value } } : null;
    };
  }

  dateRangeValidator(group: FormGroup): ValidationErrors | null {
    const startControl = group.get('ctlStart');
    const finishControl = group.get('ctlFinish');
    if (!startControl || !finishControl) {
      return null; // Retourne null si l'un des contrôles n'existe pas
    }
    const start = startControl.value;
    const finish = finishControl.value;
    return start && finish && start > finish ? { 'dateRangeInvalid': true } : null;
  }

  // Validateur bidon qui vérifie que la valeur est différente
  forbiddenValue(val: string): any {
    return (ctl: FormControl) => {
        if (ctl.value === val) {
            return { forbiddenValue: { currentValue: ctl.value, forbiddenValue: val } };
        }
        return null;
    };
  }

  selectedDatabaseChange (database: string): void {
    this.selectedDatabase = database
    console.log('--> Selected Database:', database);
    this.DB = this.databases.find(db => db.name === database)!;
  }

  onChangeType(event: any) {
    console.log('--> Event:', event);
    console.log('--> Value:', event.value);
    if (event.value == 'test') {
      this.isTest = true;
    } else {
      this.isTest = false;
    }
  }

  questionUp(questionIndex: number){
    console.log('--> Question Up');
    if (questionIndex > 0) {
      // Échanger la question actuelle avec la question précédente
      const question = this.questions![questionIndex];
      this.questions![questionIndex] = this.questions![questionIndex - 1];
      this.questions![questionIndex - 1] = question;
    }
  }

  questionDown(questionIndex: number){
    console.log('--> Question Down');
    if (questionIndex < this.questions!.length - 1) {
      const question = this.questions![questionIndex];
      this.questions![questionIndex] = this.questions![questionIndex + 1];
      this.questions![questionIndex + 1] = question;
    }
  }

  newQuestion(){
    console.log('--> New Question');
    this.questions?.push(new Question());
  }

  questionDelete(questionIndex: number){
    console.log('--> Question Delete');
    //this.questionsToDelete.push(this.questions![questionIndex]);
    this.questions?.splice(questionIndex, 1);
  }

  solutionUp(questionIndex: number, solutionIndex: number){
    console.log('--> Solution Up');
    if (solutionIndex > 0 && this.questions && this.questions[questionIndex]) {
      // Échanger la solution actuelle avec la solution précédente
      const solutions = this.questions[questionIndex].solutions;
      if (solutions) {
          const solution = solutions[solutionIndex];
          solutions[solutionIndex] = solutions[solutionIndex - 1];
          solutions[solutionIndex - 1] = solution;

          // Mettre à jour le tableau des solutions pour la question
          this.questions[questionIndex].solutions = solutions;
      }
    }
  }

  solutionDown(questionIndex: number, solutionIndex: number){
    console.log('--> Solution Down');
    if (this.questions && this.questions[questionIndex]) {
      const solutions = this.questions[questionIndex].solutions;
      if (solutions && solutionIndex < solutions.length - 1) {
          const solution = solutions[solutionIndex];
          solutions[solutionIndex] = solutions[solutionIndex + 1];
          solutions[solutionIndex + 1] = solution;

          // Mettre à jour le tableau des solutions pour la question
          this.questions[questionIndex].solutions = solutions;
      }
    }
  }

  newSolution(questionIndex: number, questionId?: number){
    console.log('--> New Solution');
    //this.questions![questionIndex].solutions!.push(new Solution());
    if (!this.questions[questionIndex].solutions)
      this.questions[questionIndex].solutions = [];
    // let newSolution = new Solution();
    //   newSolution.sql = '';
    //   newSolution.order = this.questions[questionIndex].solutions.length + 1;
    //   //newSolution.id = /* valeur appropriée */;
    //   newSolution.questionId = questionId;
    //   console.log('--> Question ID:', questionId);
    //   console.log('--> New Solution:', newSolution);
    this.questions[questionIndex].solutions.push(new Solution());
  }

  solutionDelete(questionIndex: number, solutionIndex: number){
    console.log('--> Solution Delete');
    //this.solutionToDelete.push(this.questions![questionIndex].solutions![solutionIndex]);
    this.questions![questionIndex].solutions!.splice(solutionIndex, 1);
  }

}
