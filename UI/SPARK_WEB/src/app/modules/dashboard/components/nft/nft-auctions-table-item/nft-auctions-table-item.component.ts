import { CurrencyPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Nft } from '../../../models/nft';

@Component({
  selector: '[nft-auctions-table-item]',
  standalone: true,
  templateUrl: './nft-auctions-table-item.component.html',
  imports: [AngularSvgIconModule, CurrencyPipe],
})
export class NftAuctionsTableItemComponent implements OnInit {
  @Input() auction: Nft = {} as Nft;

  constructor() {}

  ngOnInit(): void {}
}
