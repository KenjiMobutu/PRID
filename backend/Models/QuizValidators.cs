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

  }

  public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(Quiz quiz) {
        return await this.ValidateAsync(quiz, o => o.IncludeRuleSets("default", "create"));
    }

}
