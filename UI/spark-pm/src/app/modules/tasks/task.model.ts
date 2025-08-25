export interface TaskItem {
	id?: number;
	mitsNo: string; // MITS No
	taskType: string; // e.g., Bug, Feature, Improvement
	productId?: number;
	productModuleId?: number;
	title: string;
	description?: string;
	assigneeUserId?: number;
	status: 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE' | 'CANCELLED';
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	deadline?: string; // ISO date string
	points?: number; // story points
	createdAt?: string;
	updatedAt?: string;
}

export interface ProductOption { id: number; name: string; }
export interface ModuleOption { id: number; name: string; productId: number; }
export interface UserOption { id: number; firstName?: string; lastName?: string; username: string; }
