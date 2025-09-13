import { Component, EventEmitter, Input, Output, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface PointFactorConfig {
	label: string;
	key: string;
	min: number;
	max: number;
	default: number;
	weight: number; // relative weight in aggregate
	help?: string;
}

@Component({
	selector: 'app-point-calculator',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './point-calculator.component.html',
	styleUrls: ['./point-calculator.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PointCalculatorComponent implements OnInit {
	@Input() initialPoints: number | null = null;
	@Input() factors: PointFactorConfig[] = [
		{ label: 'Complexity', key: 'complexity', min: 1, max: 5, default: 3, weight: 0.35, help: 'Domain / technical complexity' },
		{ label: 'Effort', key: 'effort', min: 1, max: 5, default: 3, weight: 0.30, help: 'Relative work volume' },
		{ label: 'Risk', key: 'risk', min: 1, max: 5, default: 2, weight: 0.20, help: 'Potential for blockers / rework' },
		{ label: 'Uncertainty', key: 'uncertainty', min: 1, max: 5, default: 2, weight: 0.15, help: 'Unknowns / clarity of requirements' }
	];

	@Output() pointsChange = new EventEmitter<number>();
	@Output() closed = new EventEmitter<void>();

	form!: FormGroup;
	aggregate = 0;
	storyPoints = 0;

	// Fibonacci-like scale used commonly for story points
	private scale = [1,2,3,5,8,13,20,40,100];

	// Level descriptors for 1..5 scale
	levelLabels = ['Minimal','Low','Moderate','High','Very High'];

	getLevelLabel(val: number): string { return this.levelLabels[val-1] || String(val); }

	constructor(private fb: FormBuilder) {}

	ngOnInit(): void {
		const group: any = {};
		this.factors.forEach(f => group[f.key] = [f.default, [Validators.required, Validators.min(f.min), Validators.max(f.max)]]);
		this.form = this.fb.group(group);
		this.form.valueChanges.subscribe(() => this.recalculate());
		this.recalculate();
	}

	private recalculate() {
		const v = this.form.value;
		// Weighted normalized sum
		let totalWeight = 0; let weighted = 0;
		for (const f of this.factors) {
			const raw = Number(v[f.key]) || f.min;
			const normalized = (raw - f.min) / (f.max - f.min); // 0..1
			weighted += normalized * f.weight;
			totalWeight += f.weight;
		}
		const score0to1 = totalWeight ? (weighted / totalWeight) : 0;
		// Map 0..1 to scale index
		const idx = Math.min(this.scale.length -1, Math.max(0, Math.round(score0to1 * (this.scale.length -1))));
		this.aggregate = +(score0to1 * 100).toFixed(1);
		this.storyPoints = this.scale[idx];
	}

	confirm() { this.pointsChange.emit(this.storyPoints); }
	close() { this.closed.emit(); }
	resetDefaults() {
		this.factors.forEach(f => this.form.get(f.key)?.setValue(f.default));
	}
}

