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
import { AttemptService } from 'src/app/services/attempt.service';
import { Solution } from 'src/app/models/solution';
import { da, el } from 'date-fns/locale';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
@Component({
  selector: 'quiz-edition',
  templateUrl: './quiz-edition.component.html',
  styleUrls: ['./quiz-edition.component.css']
})

export class QuizEditionComponent implements OnInit, AfterViewInit{
  public isNew: boolean = false;
  public isTest?: boolean;
  questionControls: FormControl[] = [] ;
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
  //public ctlQuery!: FormControl;
  panelOpenState = false;
  public databases: DataBase[] = [];
  DB!: DataBase;
  query = "";
  quiz!: Quiz;
  questionSolutionGroups: { [questionId: number]: FormGroup[] } = {};
  questions: Question[] = [];
  solutions: Solution[] = [];
  deletedSolutions: Solution[] = [];
  deletedQuestions: Question[] = [];
  solutionGroups: FormGroup[] = [];
  selectedDatabase: string = '';
  errorMessage: string = '';
  quizIsTest: boolean = false;
  quizIsTrainning: boolean = false;
  public haveAttempt: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private quizService: QuizService,
    private questionService: QuestionService,
    private solutionService: SolutionService,
    private attemptService: AttemptService,
    public dialog: MatDialog,

  ){
    this.ctlName = this.fb.control('', [
      Validators.required,
      Validators.minLength(3),
      this.forbiddenValue('abc')
    ], [this.nameUsed()]);
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
    //this.ctlQuery = this.fb.control('', []);
    this.frm = this.fb.group({
      name: this.ctlName,
      description: this.ctlDescription,
      radioGroup: this.ctlRadioGroup,
      dataBase: this.ctlDataBase,
      published: this.ctlPublished,
      //dateRange: this.ctlDateRange,
      //start: this.ctlStart,
      //finish: this.ctlFinish,
      //questionBody: this.ctlQuestionBody,
      //query: this.ctlQuery,
    });
    console.log('--> Form:', this.frm);
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
      this.attemptService.getByQuizId(quizId).subscribe(attempts => {
        if(attempts.length > 0) {
          this.haveAttempt = true;
        }
      });
    });
    this.quizService.getAllDatabase().subscribe(databases => {
      this.databases = databases;
      console.log('--> Databases:', this.databases);
    });
  }

  quizEditInit(quizId: number){
    this.quizService.getOne(quizId).subscribe(quiz => {
      const dataB = this.databases.find(db => db.id === quiz?.databaseId)
      this.DB = dataB!;
      this.quiz = quiz || new Quiz();
      this.isTest = quiz?.isTest;
      //this.DB = quiz!.database;
      console.log('--> Quiz:', this.quiz);
      this.ctlName.setValue(quiz?.name);
      this.ctlDescription.setValue(quiz?.description);
      this.ctlRadioGroup.setValue(quiz?.isTest ? 'test' : 'trainning');
      this.ctlPublished.setValue(quiz?.isPublished);
      const database =  this.databases.find(db => db.id === quiz?.databaseId)
      this.ctlDataBase.setValue(database!.name);
      this.ctlDateRange.setValue(this.ctlStart.value + ' - ' + this.ctlFinish.value);
      this.ctlStart.setValue(quiz?.start);
      this.ctlFinish.setValue(quiz?.finish);
      this.ctlQuestionBody.setValue(this.questionControls.map(q => q.value));
      this.questions = quiz?.questions || [];
      this.questionControls = quiz?.questions.map(q =>
        this.fb.control(q.body, Validators.required)
      ) || [];
      console.log('--> Question Controls:', this.questionControls.map(q => q.value));
      console.log('--> Quiz NAME:', quiz?.name);
      console.log('--> isTest', this.isTest);
      console.log('--> RADIO:', this.ctlRadioGroup.value);
      console.log('--> Database:', database!.name);
      console.log('--> Range:', this.ctlDateRange.value);
      console.log('--> Start DATE:', this.ctlStart.value);
      console.log('--> End DATE:', this.ctlFinish.value);
      console.log('--> Question Body:', this.ctlQuestionBody.value);
      console.log('--> Quiz:', quiz);
      //console.log('--> Query:', this.ctlQuery.value);
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

  nameUsed(): any {
    let timeout: NodeJS.Timeout;
    return (ctl: FormControl) => {
        clearTimeout(timeout);
        const name = ctl.value;
        return new Promise(resolve => {
            timeout = setTimeout(() => {
                if (ctl.pristine) {
                    resolve(null);
                } else {
                    this.quizService.getByName(name).subscribe(quiz => {
                        resolve(quiz ? { nameUsed: true } : null);
                    });
                }
            }, 300);
        });
    };
  }

  dateNotBeforeTodayValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const controlDate = new Date(control.value);
      const currentDate = new Date();

      // ignorer l'heure, les minutes, les secondes et les millisecondes pour comparer uniquement les dates
      controlDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      const forbidden = controlDate < currentDate;
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
    console.log('--> THIS.DB:', this.DB);
  }

  onChangeType(event: any) {
    console.log('--> Event:', event);
    console.log('--> Value:', event.value);
    if (event.value == 'test') {
      this.isTest = true;
      this.quizIsTest = true;
    } else {
      this.isTest = false;
      this.quizIsTest = false;
      this.quizIsTrainning = true;
    }
  }

  onChangePublished(event: any) {
    console.log('--> Published Event:', event);
    console.log('--> Is Published:', this.ctlPublished.value);
    if (event.value == 'published') {
      this.quiz.isPublished = true;
    } else {
      this.quiz.isPublished = false;
    }
  }

  questionUp(questionIndex: number) {
    console.log('--> Question Up');
    if (questionIndex > 0) {
        // Échanger la question actuelle avec la question précédente
        const tempOrder = this.questions[questionIndex].order;
        this.questions[questionIndex].order = this.questions[questionIndex - 1].order;
        this.questions[questionIndex - 1].order = tempOrder;

        const tempQuestion = this.questions[questionIndex];
        this.questions[questionIndex] = this.questions[questionIndex - 1];
        this.questions[questionIndex - 1] = tempQuestion;
    }
  }

  questionDown(questionIndex: number) {
    console.log('--> Question Down');
    if (questionIndex < this.questions.length - 1) {
        // Échanger la question actuelle avec la question suivante
        const tempOrder = this.questions[questionIndex].order;
        this.questions[questionIndex].order = this.questions[questionIndex + 1].order;
        this.questions[questionIndex + 1].order = tempOrder;

        const tempQuestion = this.questions[questionIndex];
        this.questions[questionIndex] = this.questions[questionIndex + 1];
        this.questions[questionIndex + 1] = tempQuestion;
    }
  }

  newQuestion(){
    console.log('--> New Question');
    const newOrder = this.questions.length + 1;

    // nouvelle question avec l'ordre
    const newQuestion = new Question();
    newQuestion.order = newOrder;

    // Ajoutez la nouvelle question au tableau
    this.questions.push(newQuestion);
  }

  questionDelete(questionIndex: number){
    console.log('--> Question Delete');
    this.deletedQuestions.push(this.questions![questionIndex]);
    console.log('--> Deleted Questions:', this.deletedQuestions);
    this.questions?.splice(questionIndex, 1);
  }

  solutionUp(questionIndex: number, solutionIndex: number) {
    if (solutionIndex > 0 && this.questions && this.questions[questionIndex]) {
      const solutions = this.questions[questionIndex].solutions;
      if (solutions) {
        // Échanger les valeurs `order`
        const tempOrder = solutions[solutionIndex].order;
        solutions[solutionIndex].order = solutions[solutionIndex - 1].order;
        solutions[solutionIndex - 1].order = tempOrder;

        // Échanger les solutions
        const tempSolution = solutions[solutionIndex];
        solutions[solutionIndex] = solutions[solutionIndex - 1];
        solutions[solutionIndex - 1] = tempSolution;
      }
    }
  }

  solutionDown(questionIndex: number, solutionIndex: number) {
    if (this.questions && this.questions[questionIndex]) {
      const solutions = this.questions[questionIndex].solutions;
      if (solutions && solutionIndex < solutions.length - 1) {
        // Échanger les valeurs `order`
        const tempOrder = solutions[solutionIndex].order;
        solutions[solutionIndex].order = solutions[solutionIndex + 1].order;
        solutions[solutionIndex + 1].order = tempOrder;

        // Échanger les solutions
        const tempSolution = solutions[solutionIndex];
        solutions[solutionIndex] = solutions[solutionIndex + 1];
        solutions[solutionIndex + 1] = tempSolution;
      }
    }
  }

  newSolution(questionIndex: number, questionId?: number){
    console.log('--> New Solution');
    if(this.quiz?.id) {
      this.quizService.getOne(this.quiz!.id!).subscribe(quiz => {
        const dataB = this.databases.find(db => db.id === quiz?.databaseId)
        this.DB = dataB!;
        console.log('--> Database New Solution:', this.DB);
        console.log('--> Quiz New Solution:', quiz);
      });
    }
    const currentQuestion = this.questions[questionIndex];
    if (!currentQuestion.solutions) {
        currentQuestion.solutions = [];
    }

    // Déterminer le nouvel ordre en se basant sur le nombre de solutions existantes
    const newOrder = currentQuestion.solutions.length + 1;

    // Créer la nouvelle solution avec l'ordre approprié
    const newSolution = new Solution();
    newSolution.order = newOrder;
    newSolution.questionId = currentQuestion.id;

     // Ajouter la nouvelle solution au tableau des solutions de la question
    currentQuestion.solutions.push(newSolution);

     // Mettre à jour le tableau des questions
    this.questions[questionIndex] = currentQuestion;

  }

  solutionDelete(questionIndex: number, solutionIndex: number) {
    console.log('--> Solution Delete');
    const deletedSolution = this.questions[questionIndex].solutions[solutionIndex];
    if (deletedSolution && deletedSolution.id) {
      // Ajouter à la liste des solutions supprimées si elle a un ID (donc existait dans la base de données)
      this.deletedSolutions.push(deletedSolution);
      console.log('--> Deleted Solutions:', this.deletedSolutions);
    }
    // Retirer de la liste des solutions actuelles
    this.questions[questionIndex].solutions.splice(solutionIndex, 1);
  }

  save() {
    function adjustDateForTimezone(date: string | number | Date) {
      if (!date) return null;
      const newDate = new Date(date);
      newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());
      return newDate;
    }
    console.log('--> Save');
    console.log('Form validity:', this.frm.valid);
    console.log('Name validity:', this.ctlName.valid);
    console.log('Description validity:', this.ctlDescription.valid);
    console.log('Radio Group validity:', this.ctlRadioGroup.valid);
    console.log('Published validity:', this.ctlPublished.valid);
    console.log('Start validity:', this.ctlStart.valid);
    console.log('Finish validity:', this.ctlFinish.valid);
    console.log('Question Body validity:', this.ctlQuestionBody.valid);
    console.log('Database validity:', this.ctlDataBase.valid);
    console.log('Date Range validity:', this.ctlDateRange.valid);
    console.log('Form value:', this.frm.value);

     // Vérifier la validité de chaque question
    this.questionControls.forEach((control, index) => {
      console.log(`Question ${index} validity:`, control.valid);
    });
    if (!this.frm.valid || this.questions.length === 0 || this.questions.some(q => q.solutions.length === 0)) {
      const formValid = this.frm.valid;
      const questionsExist = this.questions.length > 0;
      const solutionsExist = this.questions.every(q => q.solutions.length > 0);

      // Initialiser une liste pour stocker les messages d'erreur
      const errorMessages: string[] = [];

      // Vérifier la validité du formulaire
      if (!formValid) {
          errorMessages.push("Le formulaire n'est pas valide.");
      }

      // Vérifier l'existence des questions
      if (!questionsExist) {
          errorMessages.push("Aucune question n'a été ajoutée.");
      }

      // Vérifier l'existence des solutions pour chaque question
      if (!solutionsExist) {
          errorMessages.push("Il manque des solutions pour certaines questions.");
      }

      // Afficher les messages d'erreur
      if (errorMessages.length > 0) {
          // Afficher les messages d'erreur sur l'interface utilisateur
          this.errorMessage = errorMessages.join("\n");
      }
      console.error('Le formulaire n\'est pas valide ou manque de questions ou de solutions.');
      return;
    }

    // Préparation des données du quiz
    const quizExists = this.quiz!.id! > 0;
    const dataB = this.databases.find(db => db.id === this.quiz!.databaseId);
    let startValue = null;
    let finishValue = null;

    if (this.quiz.isTest || this.quizIsTest) {
      startValue = this.ctlStart.value;
      finishValue = this.ctlFinish.value;
    }
    const startValueAdjusted = adjustDateForTimezone(startValue);
    const finishValueAdjusted = adjustDateForTimezone(finishValue);
    console.log('--> 0 *SAVE* Start Value:', startValue);
    console.log('--> 1 *SAVE* Start Value:', startValue);
    const quizData = {
        id: this.quiz!.id,
        name: this.ctlName.value,
        description: this.ctlDescription.value,
        isTest: this.ctlRadioGroup.value === 'test',
        isPublished: this.ctlPublished.value,
        start: startValueAdjusted!,
        finish: finishValueAdjusted!,
        databaseId: quizExists ? dataB!.id : this.DB.id,
        questions: this.questions.map(question => ({
            ...question,
            body: question.body,
            solutions: question.solutions.map(solution => ({
              ...solution,
              questionId: question.id
          }))
        })),
        isClosed: this.quiz!.isClosed,
        database: dataB!,
        status: this.quiz!.status,
        attempts: this.quiz!.attempts,
        statusAsString: this.quiz!.statusAsString,
        display: this.quiz!.display
    };

    console.log('--> QUestion BODY', this.ctlQuestionBody);
    console.log('--> 2 *SAVE* Start Value:', startValue);
    console.log('--> Quiz Data QUESTIONS:', quizData.questions);
    if(this.deletedQuestions.length > 0) {
      console.log('--> Deleted Questions:', this.deletedQuestions);
      this.deletedQuestions.forEach(question => {
        this.questionService.deleteById(question.id!).subscribe({
          next: response => {
              console.log('Question supprimée avec succès !', response);
              this.solutionService.deleteByQuestionId(question.id!).subscribe({
                next: response => {
                    console.log('Solution supprimée avec succès !', response);
                },
                error: error => {
                    console.error('Erreur lors de la suppression de la solution:', error);
                }
              });
          },
          error: error => {
              console.error('Erreur lors de la suppression de la question:', error);
          }
        });
      });
    }

    if (this.deletedSolutions.length > 0) {
      console.log('--> Deleted Solutions:', this.deletedSolutions);
      this.deletedSolutions.forEach(solution => {
        this.solutionService.deleteById(solution.id!).subscribe({
          next: response => {
              console.log('Solution supprimée avec succès !', response);
          },
          error: error => {
              console.error('Erreur lors de la suppression de la solution:', error);
          }
        });
      });
    }

    if (quizData.id! > 0) {
        // Mise à jour du quiz existant
        this.quizService.update(quizData.id!, quizData!).subscribe({
            next: response => {
                console.log('Quiz mis à jour avec succès !', response);
                this.router.navigate(['/teacher']);
            },
            error: error => {
                console.error('Erreur lors de la mise à jour du quiz:', error);
            }
        });
    } else {
        // Ajout d'un nouveau quiz
        this.quizService.add(quizData!).subscribe({
            next: response => {
                console.log('Quiz enregistré avec succès !', response);
                console.log('New Quiz Data:', quizData);
                this.router.navigate(['/teacher']);
            },
            error: error => {
                console.error('Erreur lors de la sauvegarde du quiz:', error);
            }
        });
    }
  }

  delete() {
    console.log('--> Delete');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Suppression du quiz',
        message: 'Voulez-vous vraiment supprimer le quiz?'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.quiz!.id! > 0) {
          //delete solutions
          this.quiz!.questions.forEach(question => {
            question.solutions.forEach(solution => {
              this.solutionService.deleteByQuestionId(solution.id!).subscribe({

              });
            });
          });

          //delete answers
          this.quiz!.questions.forEach(question => {
            question.answers.forEach(answer => {
              this.quizService.deleteAnswer(answer.id!).subscribe({
                next: response => {
                    console.log('Answer supprimée avec succès !', response);

                },
                error: error => {
                    console.error('Erreur lors de la suppression de la answer:', error);
                }
              });
            });
          });

          //delete questions
        this.quiz!.questions.forEach(question => {
            this.questionService.deleteByQuizId(this.quiz!.id!).subscribe({
                next: response => {
                    console.log('Question supprimée avec succès !', response);
                    this.solutionService.deleteByQuestionId(question.id!).subscribe({
                        next: response => {
                            console.log('Solution supprimée avec succès !', response);

                        },
                        error: error => {
                            console.error('Erreur lors de la suppression de la solution:', error);
                        }
                    });
                },
                error: error => {
                    console.error('Erreur lors de la suppression de la question:', error);
                }
            });
        });

          //delete attempts
          // this.quiz!.attempts.forEach(attempt => {
          //   this.quizService.deleteAttempt(attempt.id!).subscribe({
          //     next: response => {
          //         console.log('Attempt supprimée avec succès !', response);

          //     },
          //     error: error => {
          //         console.error('Erreur lors de la suppression de la attempt:', error);
          //     }
          //   });
          // });

          //delete quiz
          this.quizService.delete(this.quiz!.id!).subscribe({
              next: response => {
                  console.log('Quiz supprimé avec succès !', response);
                  this.router.navigate(['/teacher']);
              },
              error: error => {
                  console.error('Erreur lors de la suppression du quiz:', error);
              }
          });
        }
      }else {
        // L'utilisateur a annulé l'action
        console.log('Suppression du quiz annulée');
      }
    });
  }


}
