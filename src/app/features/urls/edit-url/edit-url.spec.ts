import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUrl } from './edit-url';

describe('EditUrl', () => {
  let component: EditUrl;
  let fixture: ComponentFixture<EditUrl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUrl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUrl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
