/**
 * Validation Examples
 * 
 * This file shows how to use the Joi validation schemas that are equivalent
 * to the Zod schemas you provided.
 */

const { 
    userSignUpSchema, 
    userLoginSchema, 
    userVerificationSchema,
    createUrlSchema,
    shortenUrlSchema
} = require('../src/validation/schemas');

// Example usage of validation schemas

/**
 * User Registration Example
 * Equivalent to your userSignUpSchema in Zod
 */
async function validateUserRegistration() {
    const userData = {
        username: 'johndoe123',
        email: 'john@example.com',
        password: 'SecurePass123'
    };

    try {
        const { error, value } = userSignUpSchema.validate(userData);
        
        if (error) {
            console.log('Validation Error:', error.details[0].message);
            return null;
        }
        
        console.log('✅ Valid user registration data:', value);
        return value;
    } catch (err) {
        console.error('Validation failed:', err);
        return null;
    }
}

/**
 * User Login Example
 * Equivalent to your userLoginSchema in Zod
 */
async function validateUserLogin() {
    const loginData = {
        username: 'johndoe123',
        password: 'SecurePass123'
    };

    try {
        const { error, value } = userLoginSchema.validate(loginData);
        
        if (error) {
            console.log('Validation Error:', error.details[0].message);
            return null;
        }
        
        console.log('✅ Valid login data:', value);
        return value;
    } catch (err) {
        console.error('Validation failed:', err);
        return null;
    }
}

/**
 * User Verification Example
 * Equivalent to your userVerificationSchema in Zod
 */
async function validateUserVerification() {
    const verificationData = {
        email: 'john@example.com'
    };

    try {
        const { error, value } = userVerificationSchema.validate(verificationData);
        
        if (error) {
            console.log('Validation Error:', error.details[0].message);
            return null;
        }
        
        console.log('✅ Valid verification data:', value);
        return value;
    } catch (err) {
        console.error('Validation failed:', err);
        return null;
    }
}

/**
 * URL Creation Example
 * Shows validation for authenticated URL creation
 */
async function validateUrlCreation() {
    const urlData = {
        original_url: 'https://example.com/very/long/url/that/needs/shortening',
        custom_alias: 'mylink123',
        expires_at: '2024-12-31T23:59:59Z',
        password: 'secret123',
        platform_reference: 'mobile-app'
    };

    try {
        const { error, value } = createUrlSchema.validate(urlData);
        
        if (error) {
            console.log('Validation Error:', error.details[0].message);
            return null;
        }
        
        console.log('✅ Valid URL creation data:', value);
        return value;
    } catch (err) {
        console.error('Validation failed:', err);
        return null;
    }
}

/**
 * URL Shortening Example
 * Shows validation for public URL shortening
 */
async function validateUrlShortening() {
    const shortenData = {
        original_url: 'https://example.com/some/long/url',
        custom_alias: 'short123'
    };

    try {
        const { error, value } = shortenUrlSchema.validate(shortenData);
        
        if (error) {
            console.log('Validation Error:', error.details[0].message);
            return null;
        }
        
        console.log('✅ Valid URL shortening data:', value);
        return value;
    } catch (err) {
        console.error('Validation failed:', err);
        return null;
    }
}

/**
 * Example of validation with errors
 */
async function showValidationErrors() {
    console.log('\n=== Validation Error Examples ===\n');
    
    // Invalid registration data
    const invalidUserData = {
        username: 'ab', // Too short
        email: 'invalid-email', // Invalid format
        password: 'weak' // Too short, missing requirements
    };

    const { error: regError } = userSignUpSchema.validate(invalidUserData, { abortEarly: false });
    if (regError) {
        console.log('❌ Registration validation errors:');
        regError.details.forEach(detail => {
            console.log(`   - ${detail.path.join('.')}: ${detail.message}`);
        });
    }

    // Invalid login data
    const invalidLoginData = {
        username: 'ab', // Too short
        password: '123' // Too short
    };

    const { error: loginError } = userLoginSchema.validate(invalidLoginData, { abortEarly: false });
    if (loginError) {
        console.log('\n❌ Login validation errors:');
        loginError.details.forEach(detail => {
            console.log(`   - ${detail.path.join('.')}: ${detail.message}`);
        });
    }
}

/**
 * Type inference equivalent to z.infer<typeof schema>
 * 
 * In TypeScript, you would use the JSDoc types:
 * @type {import('../src/validation/schemas').CreateUserInput}
 */
function typeInferenceExample() {
    /**
     * @type {import('../src/validation/schemas').CreateUserInput}
     */
    const userData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass123'
    };

    /**
     * @type {import('../src/validation/schemas').LoginUserInput}
     */
    const loginData = {
        username: 'johndoe',
        password: 'SecurePass123'
    };

    console.log('✅ Type inference examples completed');
    return { userData, loginData };
}

// Run examples
async function runExamples() {
    console.log('🚀 Running Validation Examples\n');
    
    await validateUserRegistration();
    await validateUserLogin();
    await validateUserVerification();
    await validateUrlCreation();
    await validateUrlShortening();
    await showValidationErrors();
    typeInferenceExample();
    
    console.log('\n✅ All examples completed!');
}

// Export for use in other files
module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateUserVerification,
    validateUrlCreation,
    validateUrlShortening,
    showValidationErrors,
    typeInferenceExample,
    runExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
    runExamples().catch(console.error);
}