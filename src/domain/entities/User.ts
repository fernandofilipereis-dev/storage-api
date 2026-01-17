import { v4 as uuidv4 } from 'uuid';

export interface UserProps {
    id?: string;
    name: string;
    email: string;
    password: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class User {
    private readonly _id: string;
    private _name: string;
    private _email: string;
    private _password: string;
    private _isActive: boolean;
    private readonly _createdAt: Date;
    private _updatedAt: Date;

    constructor(props: UserProps) {
        this._id = props.id || uuidv4();
        this._name = props.name;
        this._email = props.email;
        this._password = props.password;
        this._isActive = props.isActive ?? true;
        this._createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();

        this.validate();
    }

    private validate(): void {
        if (!this._name || this._name.trim().length === 0) {
            throw new Error('Name is required');
        }

        if (this._name.length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        if (!this._email || this._email.trim().length === 0) {
            throw new Error('Email is required');
        }

        if (!this._password || this._password.length === 0) {
            throw new Error('Password is required');
        }
    }

    // Getters
    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get email(): string {
        return this._email;
    }

    get password(): string {
        return this._password;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    // Business methods
    updateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error('Name is required');
        }

        if (name.length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        this._name = name;
        this._updatedAt = new Date();
    }

    updateEmail(email: string): void {
        if (!email || email.trim().length === 0) {
            throw new Error('Email is required');
        }

        this._email = email;
        this._updatedAt = new Date();
    }

    updatePassword(password: string): void {
        if (!password || password.length === 0) {
            throw new Error('Password is required');
        }

        this._password = password;
        this._updatedAt = new Date();
    }

    activate(): void {
        this._isActive = true;
        this._updatedAt = new Date();
    }

    deactivate(): void {
        this._isActive = false;
        this._updatedAt = new Date();
    }

    toJSON() {
        return {
            id: this._id,
            name: this._name,
            email: this._email,
            isActive: this._isActive,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }
}
