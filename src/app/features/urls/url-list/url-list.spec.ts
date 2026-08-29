import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlList } from './url-list';

describe('UrlList', () => {
  let component: UrlList;
  let fixture: ComponentFixture<UrlList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrlList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
