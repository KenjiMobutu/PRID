using FluentValidation;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using prid_2324_a11.Helpers;

namespace prid_2324_a11.Models;

public class QuizValidator : AbstractValidator<Quiz>{
    private readonly PridContext _context;
    public QuizValidator(PridContext context){
        _context = context;
        RuleSet("create", () => {
                RuleFor(q => q.Id)
                .Must(id => id == default(int)).WithMessage("L'ID est auto-incrémenté et ne doit pas être spécifié manuellement.");
        });

        RuleSet("create", () => {
                RuleFor(q => q.Name)
                .NotEmpty().WithMessage("Le nom du quiz est obligatoire.")
                .Length(3, 50).WithMessage("Le nom du quiz doit avoir une longueur comprise entre 3 et 50 caractères.")
                .MustAsync(async (name, cancellation) => await BeUniqueQuizName(name))
                .WithMessage("Le nom du quiz est déjà utilisé.");

                RuleFor(q => q.Questions)
                    .NotEmpty().WithMessage("Tout quiz doit posséder au moins une question.");

                RuleForEach(q => q.Questions)
                    .SetValidator(new QuestionValidator());

                RuleFor(q => q.Start)
                    .NotEmpty().WithMessage("La date de début est obligatoire.")
                    .When(q => q.IsTest);

                RuleFor(q => q.Finish)
                    .NotEmpty().WithMessage("La date de fin est obligatoire.")
                    .When(q => q.IsTest);
        });

        RuleSet("update", () => {
                RuleFor(q => q.Name)
                .NotEmpty().WithMessage("Le nom du quiz est obligatoire.")
                .Length(3, 50).WithMessage("Le nom du quiz doit avoir une longueur comprise entre 3 et 50 caractères.")
                .MustAsync(async (name, cancellation) => await BeUniqueQuizName(name))
                .WithMessage("Le nom du quiz est déjà utilisé.");

                RuleFor(q => q.Questions)
                    .NotEmpty().WithMessage("Tout quiz doit posséder au moins une question.");

                RuleForEach(q => q.Questions)
                    .SetValidator(new QuestionValidator());

                RuleFor(q => q.Start)
                    .NotEmpty().WithMessage("La date de début est obligatoire.")
                    .When(q => q.IsTest);

                RuleFor(q => q.Finish)
                    .NotEmpty().WithMessage("La date de fin est obligatoire.")
                    .When(q => q.IsTest);
        });

    }

    private async Task<bool> BeUniqueQuizName(string name) {
        // Check if the pseudo is unique in DB
        var existingName = await _context.Quizzes.FirstOrDefaultAsync(q => q.Name == name);
        return existingName == null;
    }

    public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(Quiz quiz) {
        return await this.ValidateAsync(quiz, o => o.IncludeRuleSets("default", "create"));
    }

}

public class QuestionValidator : AbstractValidator<Question>{
    public QuestionValidator(){
        RuleFor(q => q.Body)
            .MinimumLength(2).WithMessage("La propriété Body d'une question doit contenir au moins deux caractères (les espaces ne comptent pas).");

        RuleFor(q => q.Solutions)
            .NotEmpty().WithMessage("Toute question doit posséder au moins une solution.");

        RuleForEach(q => q.Solutions)
            .SetValidator(new SolutionValidator());
    }
}

public class SolutionValidator : AbstractValidator<Solution>{
    public SolutionValidator(){
        RuleFor(s => s.Sql)
            .NotEmpty().WithMessage("La propriété Sql d'une solution ne peut pas être vide (les espaces ne comptent pas).");
    }
}
