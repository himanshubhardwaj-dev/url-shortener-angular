import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlAnalytics } from './url-analytics';

describe('UrlAnalytics', () => {
  let component: UrlAnalytics;
  let fixture: ComponentFixture<UrlAnalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlAnalytics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrlAnalytics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
