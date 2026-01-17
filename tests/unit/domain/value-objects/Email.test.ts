import { Email } from '../../../../src/domain/value-objects/Email';

describe('Email Value Object', () => {
    it('should create email with valid format', () => {
        const validEmail = 'test@example.com';
        const email = new Email(validEmail);

        expect(email.value).toBe(validEmail);
    });

    it('should throw error for empty email', () => {
        expect(() => new Email('')).toThrow('Email is required');
    });

    it('should throw error for invalid email format', () => {
        const invalidEmails = [
            'invalid',
            'invalid@',
            '@invalid.com',
            'invalid@.com',
            'invalid@domain',
        ];

        invalidEmails.forEach((invalidEmail) => {
            expect(() => new Email(invalidEmail)).toThrow('Invalid email format');
        });
    });

    it('should compare emails case-insensitively', () => {
        const email1 = new Email('Test@Example.com');
        const email2 = new Email('test@example.com');

        expect(email1.equals(email2)).toBe(true);
    });

    it('should convert to string', () => {
        const emailString = 'test@example.com';
        const email = new Email(emailString);

        expect(email.toString()).toBe(emailString);
    });
});
