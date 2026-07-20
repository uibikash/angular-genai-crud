import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app'; // Or './app/app.component' depending on your file name
import { config } from './app/app.config.server';

const bootstrap = (options: any) => bootstrapApplication(AppComponent, config, options);

export default bootstrap;