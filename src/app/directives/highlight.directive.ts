import { Directive, ElementRef, Input, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnInit {
  @Input('appHighlight') highlight = 'rgba(99, 102, 241, 0.16)';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.2s ease');
    this.renderer.setStyle(this.el.nativeElement, 'boxShadow', `inset 0 0 0 2px ${this.highlight}`);
  }
}
