import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BiddingPage } from './bidding.page';

describe('BiddingPage', () => {
  let component: BiddingPage;
  let fixture: ComponentFixture<BiddingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BiddingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
