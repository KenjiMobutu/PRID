using FluentValidation;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

namespace prid_tuto.Models;

public class UserValidator : AbstractValidator<User>{
    private readonly MsnContext _context;

    public UserValidator(MsnContext context) {
        _context = context;

        RuleFor(u => u.Id)
            .GreaterThanOrEqualTo(0).WithMessage("L'ID doit être supérieur ou égal à 0.")
            .Must(id => id == default(int)).WithMessage("L'ID est auto-incrémenté et ne doit pas être spécifié manuellement.");

        RuleFor(u => u.Pseudo)
                .NotEmpty().WithMessage("Le Pseudo Est Obligatoire.")
                .Length(3, 10).WithMessage("Le Pseudo Doit Avoir Une Longueur Comprise Entre 3 Et 10 Caractères.")
                .Must(BeValidPseudo).WithMessage("Le Pseudo Doit Contenir Uniquement Des Lettres Non Accentuées, Des Chiffres Ou Le Caractère Underscore (_) Et Doit Commencer Par Une Lettre.");

        // Validations spécifiques pour la création: Pseudo
        RuleSet("create", () => {
            RuleFor(u => u.Pseudo)
            .MustAsync(async (pseudo, cancellation) => await BeUniquePseudo(pseudo))
            .WithMessage("Le pseudo est déjà utilisé par un autre utilisateur.");
        });

        RuleFor(u => u.Password)
                .NotEmpty().WithMessage("Le mot de passe est obligatoire.")
                .Length(3, 10).WithMessage("Le mot de passe doit avoir une longueur comprise entre 3 et 10 caractères.");

        RuleFor(u => u.Email)
                .NotEmpty().WithMessage("L'email est obligatoire.")
                .Must(BeAValidEmail).WithMessage("L'email doit correspondre au format d'une adresse email.");

        // Validations spécifiques pour la création: Email
        RuleSet("create", () => {
            RuleFor(u => u.Email)
            .MustAsync(async (email, cancellation) => await BeUniqueEmail(email))
            .WithMessage("L'email est déjà utilisé par un autre utilisateur.");
        });

        RuleFor(u => u.LastName)
            //.Cascade(CascadeMode.StopOnFirstFailure) // Stop validation on the first failure
            .NotEmpty().WithMessage("Le nom de famille est obligatoire lorsque le prénom est renseigné.")
            .Length(3, 50).WithMessage("Le nom de famille doit avoir une longueur comprise entre 3 et 50 caractères.")
            .Must(NotContainWhitespace).WithMessage("Le nom de famille ne peut pas commencer ou se terminer par un espace ou une tabulation.")
            .When(u => !string.IsNullOrEmpty(u.FirstName)); // Apply these rules only when FirstName is not null or empty

        RuleFor(u => u.FirstName)
            //.Cascade(CascadeMode.StopOnFirstFailure) // Stop validation on the first failure
            .NotEmpty().WithMessage("Le prénom est obligatoire lorsque le nom de famille est renseigné.")
            .Length(3, 50).WithMessage("Le prénom doit avoir une longueur comprise entre 3 et 50 caractères.")
            .Must(NotContainWhitespace).WithMessage("Le prénom ne peut pas commencer ou se terminer par un espace ou une tabulation.")
            .When(u => !string.IsNullOrEmpty(u.LastName));

        RuleFor(u => u.BirthDate)
            .Empty()
            .When(u => u.BirthDate == null) // BirthDate is optional, so it can be empty (null)
            .Must(BeValidAge).WithMessage("La date de naissance doit correspondre à un âge compris entre 18 et 125 ans.");

        RuleFor(u => u.LastName)
            .Must((user, lastName) => BeUniqueCombination(user, lastName, user.FirstName))
            .WithMessage("La combinaison du nom de famille et du prénom doit être unique, sauf si les deux champs sont nuls.");

        RuleFor(u => new { u.FirstName, u.LastName })
            .MustAsync(async (names, token) => {
                // Si FirstName et LastName sont tous les deux nuls, la combinaison est considérée comme unique
                if (string.IsNullOrWhiteSpace(names.FirstName) && string.IsNullOrWhiteSpace(names.LastName))
                    return true;

                // Vérifiez s'il existe déjà un utilisateur avec la même combinaison FirstName et LastName
                return !await _context.Users.AnyAsync(other =>
                    other.FirstName == names.FirstName && other.LastName == names.LastName);
            })
            .WithMessage("La combinaison de 'FirstName' et 'LastName' doit être unique sauf si les deux champs sont nuls.");
    }

    private bool BeValidPseudo(String Pseudo) {
        // Regular Expression Pattern To Match The Allowed Characters And Starting With A Letter
        String Pattern = "^[A-Za-z][A-Za-z0-9_]*$";
        return Regex.IsMatch(Pseudo, Pattern);
    }

    private bool BeAValidEmail(string email) {
        // Use a regular expression to validate the email format
        const string pattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
        return Regex.IsMatch(email, pattern);
    }

    private async Task<bool> BeUniquePseudo(string pseudo) {
        // Check if the pseudo is unique in DB
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Pseudo == pseudo);
        return existingUser == null;
    }

    private async Task<bool> BeUniqueEmail(string email) {
        // Check if the email is unique in DB
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        return existingUser == null;
    }

    private bool NotContainWhitespace(string name) {
        if (string.IsNullOrWhiteSpace(name)) {
            return true; // Allow null or empty strings
        }
        return !char.IsWhiteSpace(name[0]) && !char.IsWhiteSpace(name[name.Length - 1]);
    }

    private bool BeValidAge(DateTime? birthDate) {
        if (!birthDate.HasValue) {
            return true; // If it's optional (null), it's considered valid
        }

        var today = DateTime.Today;
        var age = today.Year - birthDate.Value.Year;

        // Check if the age falls within the valid range (18 to 125)
        return age >= 18 && age <= 125;
    }

    private bool BeUniqueCombination(User user, string lastName, string firstName) {
        // If both LastName and FirstName are null, the combination is considered unique
        if (string.IsNullOrEmpty(lastName) && string.IsNullOrEmpty(firstName)) {
            return true;
        }

        // Check if a user with the same LastName and FirstName already exists in the database
        var existingUser = _context.Users.FirstOrDefault(u => u.LastName == lastName && u.FirstName == firstName);

        // If an existing user is found (other than the current user), the combination is not unique
        return existingUser == null || existingUser.Id == user.Id;
    }

    public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(User user) {
        return await this.ValidateAsync(user, o => o.IncludeRuleSets("default", "create"));
    }

}
