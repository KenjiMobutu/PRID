namespace prid_2324_a11.Models;
public class QueryDTO{
    public List<string> Error { get; set; } = new List<string>();
    public string[] ColumnNames { get; set; } = new string[0];
    public string[][] Data { get; set; } = new string[0][];
    public string Query { get; set; } = null!;
    public string DbName { get; set; } = null!;
    public string CorrectMessage { get; set; } = "";
    public int QuestionId { get; set; }
    public DateTime Timestamp { get; set; }

    // Validation du résultat d'une requête
    public QueryDTO CheckQueries(QueryDTO query){
        // Vérifier si le nombre de lignes est différent
        if (Data.Length != query.Data.Length){
            Error.Add("Nombre de lignes incorrect \n");
        }

        // Vérifier si le nombre de colonnes est différent
        if (ColumnNames.Length != query.ColumnNames.Length){
            Error.Add("Nombre de colonnes incorrect \n");
        }

        // Comparaison des données si pas d'erreur à ce stade
        if (!Error.Any()){
            var userFlatData = ColumnNames.Concat(Data.SelectMany(row => row.Select(ConvertToString))).OrderBy(x => x).ToList();
            var solutionFlatData = query.ColumnNames.Concat(query.Data.SelectMany(row => row.Select(ConvertToString))).OrderBy(x => x).ToList();

            if (!userFlatData.SequenceEqual(solutionFlatData)){
                Error.Add("wrong data");
            }
        }

        if (!Error.Any()){
            CorrectMessage = "Votre requête a retourné une réponse correcte ! Néanmoins, comparez votre solution avec celle(s) ci-dessous pour voir si vous n'avez pas eu un peu de chance :)!!!!";
        }

        return this;
    }

    private string ConvertToString(object obj){
        return obj?.ToString() ?? "";
    }
}
