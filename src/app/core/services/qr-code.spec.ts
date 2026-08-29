import { TestBed } from '@angular/core/testing';

import { QrCode } from './qr-code';

describe('QrCode', () => {
  let service: QrCode;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QrCode);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
