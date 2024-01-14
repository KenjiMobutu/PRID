import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-fetch-data',
    templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent {
  public forecasts?: WeatherForecast[];

    constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
        http.get<WeatherForecast[]>(baseUrl + 'WeatherForecast').subscribe({
            next: result => {
                this.forecasts = result;
                //setTimeout(() => this.forecasts = undefined, 2000);
            },
            error: error => console.error(error)
        });
    }
}

interface WeatherForecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}
