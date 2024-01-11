import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Quiz, Question } from '../../models/quiz';
import { MatDialog } from '@angular/material/dialog';
import { QuizService } from 'src/app/services/quiz.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash-es';
import { QuestionService } from 'src/app/services/question.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { DataBase } from 'src/app/models/database';
import { SolutionService } from 'src/app/services/solution.service';
import { AttemptService } from 'src/app/services/attempt.service';
import { Solution } from 'src/app/models/solution';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
@Component({
  selector: 'quiz-edition',
  templateUrl: './quiz-edition.component.html',
  styleUrls: ['./quiz-edition.component.css']
})

export class QuizEditionComponent implements OnInit, AfterViewInit{
  public isNew: boolean = false;
  public isTest?: boolean;
  idQuiz?: number;
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
  //public ctlQuestionBody!: FormControl;
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
    this.ctlStart = this.fb.control('', []);
    this.ctlFinish = this.fb.control('', []);
    this.range = this.fb.group({
      ctlStart: this.ctlStart,
      ctlEnd: this.ctlFinish
    }, { validators: this.dateRangeValidator });

    this.questionControls.forEach(control => {
      control.setValidators([Validators.required, Validators.minLength(3)]);
      control.updateValueAndValidity();
    });

    this.frm = this.fb.group({
      name: this.ctlName,
      description: this.ctlDescription,
      radioGroup: this.ctlRadioGroup,
      dataBase: this.ctlDataBase,
      published: this.ctlPublished,
      dateRange: this.ctlDateRange,
      start: this.ctlStart,
      finish: this.ctlFinish,
      questionBody: this.questionControls.map(q => q.value),
      //query: this.ctlQuery,
    });
    console.log('--> Form:', this.frm);
  }

  ngOnInit() {
    this.quizService.getAllDatabase().subscribe(databases => {
      this.databases = databases;
      console.log('--> Databases:', this.databases);
    });
    this.route.params.subscribe(params => {
      const quizId = +params['id'];
      this.idQuiz = quizId;
      this.quizService.getOne(quizId).subscribe(quiz => {
        const dataB = this.databases.find(db => db.id === quiz?.databaseId!)
        console.log('--> INIT Database:', dataB);
        console.log('--> INIT Quiz:', quiz);
        this.DB = dataB!;
        quiz!.database= dataB!;
        quiz!.databaseName = dataB!.name;
      });
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
  }

  quizEditInit(quizId: number){
    this.quizService.getOne(quizId).subscribe(quiz => {
      const dataB = this.databases.find(db => db.id === quiz?.databaseId)
      this.DB = dataB!;
      this.quiz = quiz || new Quiz();
      quiz!.database= dataB!;
      quiz!.databaseName = dataB!.name;
      this.isTest = quiz?.isTest;
      //this.DB = quiz!.database;
      console.log('--> Quiz:', this.quiz);
      // Réinitialisation du contrôle du nom
      this.ctlName.setValue(quiz?.name);
      this.ctlDescription.setValue(quiz?.description);
      this.ctlRadioGroup.setValue(quiz?.isTest ? 'test' : 'trainning');
      this.ctlPublished.setValue(quiz?.isPublished);
      const database =  this.databases.find(db => db.id === quiz?.databaseId)
      this.ctlDataBase.setValue(database!.name);
      this.ctlDateRange.setValue(this.ctlStart.value + ' - ' + this.ctlFinish.value);
      this.ctlStart.setValue(quiz?.start);
      this.ctlFinish.setValue(quiz?.finish);
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
      console.log('--> Quiz:', quiz);
      this.questions = quiz?.questions ?? [];
      console.log('--> Questions:', this.questions);
      this.questions = this.questions.map(q => ({ ...q, isOpen: false }));
    });
  }

  getFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl || new FormControl();
  }

  nameUsed(): any {
    let timeout: NodeJS.Timeout;
    let originalName: string | undefined;

    return async (ctl: FormControl) => {
      originalName! = this.quiz?.name!;
        clearTimeout(timeout);
        const newName = ctl.value;

        return new Promise(async resolve => {
            timeout = setTimeout(async () => {
                if (ctl.pristine) {
                    resolve(null);
                } else {
                    // Attendre que les noms des quiz soient récupérés
                    const quizzes = await this.quizService.getAll().toPromise();
                    const quizNames = quizzes!.map(q => q.name).filter(name => name !== originalName);
                    console.log('-->*** Quiz Names:', quizNames);

                    // Vérifier si le nom existe déjà dans la base de données
                    const isNameUsed = quizNames.includes(newName);
                    console.log('-->*** isNameUsed:', isNameUsed);
                    resolve(isNameUsed ? { nameUsed: true } : null);
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
      this.ctlStart.setValidators([this.dateNotBeforeTodayValidator()]);
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

  // save() {
  //   function adjustDateForTimezone(date: string | number | Date) {
  //     if (!date) return null;
  //     const newDate = new Date(date);
  //     newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());
  //     return newDate;
  //   }
  //   console.log('--> Save');
  //   console.log('Form validity:', this.frm.valid);
  //   console.log('Name validity:', this.ctlName.valid);
  //   console.log('Name value:', this.ctlName);
  //   console.log('Description validity:', this.ctlDescription.valid);
  //   console.log('Radio Group validity:', this.ctlRadioGroup.valid);
  //   console.log('Published validity:', this.ctlPublished.valid);
  //   console.log('Start validity:', this.ctlStart.valid);
  //   console.log('Finish validity:', this.ctlFinish.valid);
  //   console.log('Question Body validity:', this.questionControls.forEach((control, index) => { console.log(`Question ${index} validity:`, control.valid);}));
  //   console.log('Database validity:', this.ctlDataBase.valid);
  //   console.log('Date Range validity:', this.ctlDateRange.valid);
  //   console.log('Form value:', this.frm.value);

  //    // Vérifier la validité de chaque question
  //   this.questionControls.forEach((control, index) => {
  //     console.log(`Question ${index} validity:`, control.valid);
  //   });
  //   if (!this.frm.valid || this.questions.length === 0 || this.questions.some(q => q.solutions.length === 0) || this.questions.some(q => q.body === '') || this.questions.some(q => q.body.length < 3)) {
  //     const formValid = this.frm.valid;
  //     const questionsExist = this.questions.length > 0;
  //     const solutionsExist = this.questions.every(q => q.solutions.length > 0);

  //     // Initialiser une liste pour stocker les messages d'erreur
  //     const errorMessages: string[] = [];

  //     // Vérifier la validité du formulaire
  //     if (!formValid) {
  //         errorMessages.push("Le formulaire n'est pas valide.");
  //     }

  //     if(this.questions.some(q => q.body === '') || this.questions.some(q => q.body.length < 3)){
  //       errorMessages.push("Le titre de la question ne peut etre vide ou inférieur à 3 caractères.");
  //     }

  //     // Vérifier l'existence des questions
  //     if (!questionsExist) {
  //         errorMessages.push("Aucune question n'a été ajoutée.");
  //     }

  //     // Vérifier l'existence des solutions pour chaque question
  //     if (!solutionsExist) {
  //         errorMessages.push("Il manque des solutions pour certaines questions.");
  //     }

  //     // Afficher les messages d'erreur
  //     if (errorMessages.length > 0) {
  //         // Afficher les messages d'erreur sur l'interface utilisateur
  //         this.errorMessage = errorMessages.join("\n");
  //     }
  //     console.error('Le formulaire n\'est pas valide ou manque de questions ou de solutions.');
  //     return;
  //   }

  //   // Préparation des données du quiz
  //   const quizExists = this.quiz!.id! > 0;
  //   const dataB = this.databases.find(db => db.id === this.quiz!.databaseId);
  //   let startValue = null;
  //   let finishValue = null;

  //   if (this.quiz.isTest || this.quizIsTest) {
  //     startValue = this.ctlStart.value;
  //     finishValue = this.ctlFinish.value;
  //   }

  //   const startValueAdjusted = adjustDateForTimezone(startValue);
  //   const finishValueAdjusted = adjustDateForTimezone(finishValue);
  //   console.log('--> 0 *SAVE* Start Value:', startValue);
  //   console.log('--> 1 *SAVE* Start Value:', startValue);
  //   const name = this.ctlName.value;
  //   const quizData = {
  //       id: this.quiz!.id,
  //       name: name,
  //       description: this.ctlDescription.value,
  //       isTest: this.ctlRadioGroup.value === 'test',
  //       isPublished: this.ctlPublished.value,
  //       start: startValueAdjusted ? startValueAdjusted : null,
  //       finish: finishValueAdjusted ? finishValueAdjusted : null,
  //       databaseId: quizExists ? dataB!.id : this.DB.id,
  //       questions: this.questions.map(question => ({
  //           ...question,
  //           body: question.body,
  //           solutions: question.solutions.map(solution => ({
  //             ...solution,
  //             questionId: question.id
  //         }))
  //       })),
  //       isClosed: this.quiz!.isClosed,
  //       database: dataB!,
  //       status: this.quiz!.status,
  //       attempts: this.quiz!.attempts,
  //       statusAsString: this.quiz!.statusAsString,
  //       display: this.quiz!.display
  //   };


  //   //console.log('--> QUestion BODY', this.ctlQuestionBody);
  //   console.log('--> 2 *SAVE* Start Value:', startValue);
  //   console.log('--> Quiz Data QUESTIONS:', quizData.questions);
  //   if(this.deletedQuestions.length > 0) {
  //     console.log('--> Deleted Questions:', this.deletedQuestions);
  //     this.deletedQuestions.forEach(question => {
  //       this.questionService.deleteById(question.id!).subscribe({
  //         next: response => {
  //             console.log('Question supprimée avec succès !', response);
  //             this.solutionService.deleteByQuestionId(question.id!).subscribe({
  //               next: response => {
  //                   console.log('Solution supprimée avec succès !', response);
  //               },
  //               error: error => {
  //                   console.error('Erreur lors de la suppression de la solution:', error);
  //               }
  //             });
  //         },
  //         error: error => {
  //             console.error('Erreur lors de la suppression de la question:', error);
  //         }
  //       });
  //     });
  //   }

  //   if (this.deletedSolutions.length > 0) {
  //     console.log('--> Deleted Solutions:', this.deletedSolutions);
  //     this.deletedSolutions.forEach(solution => {
  //       this.solutionService.deleteById(solution.id!).subscribe({
  //         next: response => {
  //             console.log('Solution supprimée avec succès !', response);
  //         },
  //         error: error => {
  //             console.error('Erreur lors de la suppression de la solution:', error);
  //         }
  //       });
  //     });
  //   }

  //   if (quizData.id! > 0) {
  //       // Mise à jour du quiz existant
  //       this.quizService.update(quizData.id!, quizData!).subscribe({
  //           next: response => {
  //               console.log('Quiz mis à jour avec succès !', response);
  //               this.router.navigate(['/teacher']);
  //           },
  //           error: error => {
  //               console.error('Erreur lors de la mise à jour du quiz:', error);
  //           }
  //       });
  //   } else {
  //       // Ajout d'un nouveau quiz
  //       this.quizService.add(quizData!).subscribe({
  //           next: response => {

  //               console.log('Quiz enregistré avec succès !', response);
  //               console.log('New Quiz Data:', quizData);
  //               this.router.navigate(['/teacher']);
  //           },
  //           error: error => {
  //               console.error('Erreur lors de la sauvegarde du quiz:', error);
  //           }
  //       });
  //   }
  // }

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



  // Fonction pour sauvegarder le formulaire
  save() {
    console.log('--> Save');
    console.log('Form validity:', this.frm.valid);

    if (!this.isFormValid()) {
        this.handleFormErrors();
        return;
    }

    const quizData = this.prepareQuizData();

    this.deleteQuestionsAndSolutions();

    this.saveOrUpdateQuiz(quizData);
  }

  // Fonction pour vérifier la validité du formulaire
  isFormValid(): boolean {
    return (
        this.frm.valid &&
        this.questions.length > 0 &&
        this.questions.every(q => q.solutions.length > 0) &&
        !this.questions.some(q => q.body === '' || q.body.length < 3)
    );
  }

  // Fonction pour gérer les erreurs du formulaire
  handleFormErrors() {
    const errorMessages: string[] = [];

    if (!this.frm.valid) {
        errorMessages.push("Le formulaire n'est pas valide.");
    }

    if (this.questions.some(q => q.body === '') || this.questions.some(q => q.body.length < 3)) {
        errorMessages.push("Le titre de la question ne peut être vide ou inférieur à 3 caractères.");
    }

    if (this.questions.length === 0) {
        errorMessages.push("Aucune question n'a été ajoutée.");
    }

    if (!this.questions.every(q => q.solutions.length > 0)) {
        errorMessages.push("Il manque des solutions pour certaines questions.");
    }

    if (errorMessages.length > 0) {
        this.errorMessage = errorMessages.join("\n");
    }

    console.error('Le formulaire n\'est pas valide ou manque de questions ou de solutions.');
  }

  // Fonction pour préparer les données du quiz
  prepareQuizData(): any {
    const quizExists = this.quiz!.id! > 0;
    const dataB = this.databases.find(db => db.id === this.quiz!.databaseId);
    let startValue = null;
    let finishValue = null;

    if (this.quiz.isTest || this.quizIsTest) {
        startValue = this.ctlStart.value;
        finishValue = this.ctlFinish.value;
    }

    const startValueAdjusted = this.adjustDateForTimezone(startValue);
    const finishValueAdjusted = this.adjustDateForTimezone(finishValue);

    const name = this.ctlName.value;

    return {
        id: this.quiz!.id,
        name: name,
        description: this.ctlDescription.value,
        isTest: this.ctlRadioGroup.value === 'test',
        isPublished: this.ctlPublished.value,
        start: startValueAdjusted ? startValueAdjusted : null,
        finish: finishValueAdjusted ? finishValueAdjusted : null,
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
  }

  // Fonction pour supprimer les questions et solutions
  deleteQuestionsAndSolutions() {
    if (this.deletedQuestions.length > 0) {
        this.deletedQuestions.forEach(question => {
            this.deleteQuestionAndSolutions(question);
        });
    }

    if (this.deletedSolutions.length > 0) {
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
  }

  // Fonction pour supprimer une question et ses solutions
  deleteQuestionAndSolutions(question: any) {
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
  }

  // Fonction pour sauvegarder ou mettre à jour le quiz
  saveOrUpdateQuiz(quizData: any) {
    if (quizData.id! > 0) {
        this.updateQuiz(quizData);
    } else {
        this.addNewQuiz(quizData);
    }
  }

  // Fonction pour mettre à jour un quiz existant
  updateQuiz(quizData: any) {
    this.quizService.update(quizData.id!, quizData).subscribe({
        next: response => {
            console.log('Quiz mis à jour avec succès !', response);
            this.router.navigate(['/teacher']);
        },
        error: error => {
            console.error('Erreur lors de la mise à jour du quiz:', error);
        }
    });
  }

  // Fonction pour ajouter un nouveau quiz
  addNewQuiz(quizData: any) {
    this.quizService.add(quizData).subscribe({
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

  // Fonction pour ajuster la date en fonction du fuseau horaire
  adjustDateForTimezone(date: string | number | Date) {
    if (!date) return null;
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());
    return newDate;
  }



}
