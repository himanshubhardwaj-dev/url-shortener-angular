import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUrl } from './create-url';

describe('CreateUrl', () => {
  let component: CreateUrl;
  let fixture: ComponentFixture<CreateUrl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUrl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUrl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
