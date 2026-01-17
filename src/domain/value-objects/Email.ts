export class Email {
    private readonly _value: string;

    constructor(value: string) {
        this._value = value;
        this.validate();
    }

    private validate(): void {
        if (!this._value || this._value.trim().length === 0) {
            throw new Error('Email is required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this._value)) {
            throw new Error('Invalid email format');
        }
    }

    get value(): string {
        return this._value;
    }

    equals(other: Email): boolean {
        return this._value.toLowerCase() === other._value.toLowerCase();
    }

    toString(): string {
        return this._value;
    }
}
