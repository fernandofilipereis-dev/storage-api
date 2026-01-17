import { swaggerSpec } from '../src/presentation/swagger/swagger';
import * as fs from 'fs';
import * as path from 'path';
const Converter = require('openapi-to-postmanv2');

const postmanDir = path.join(__dirname, '../postman');
const postmanCollectionPath = path.join(postmanDir, 'postman_collection.json');

// Ensure postman directory exists
if (!fs.existsSync(postmanDir)) {
    fs.mkdirSync(postmanDir, { recursive: true });
}

console.log('Generating Postman collection and separate environments...');

const swaggerData = JSON.stringify(swaggerSpec);

Converter.convert(
    { type: 'string', data: swaggerData },
    {
        folderStrategy: 'Tags',
        includeAuthInfoInExample: true
    },
    (_err: any, conversionResult: any) => {
        if (!conversionResult.result) {
            console.error('Could not convert:', conversionResult.reason);
            process.exit(1);
        }

        // Save Collection
        fs.writeFileSync(
            postmanCollectionPath,
            JSON.stringify(conversionResult.output[0].data, null, 2)
        );
        console.log(`✅ Postman collection generated at: ${postmanCollectionPath}`);

        // Helper to generate environment
        const createEnvironment = (envName: string, baseUrl: string) => {
            const environment = {
                id: `storage-api-${envName.toLowerCase()}-env`,
                name: `Storage API ${envName}`,
                values: [
                    {
                        key: 'baseUrl',
                        value: baseUrl,
                        enabled: true,
                        type: 'default'
                    },
                    {
                        key: 'bearerToken',
                        value: '',
                        enabled: true,
                        type: 'default'
                    }
                ],
                _postman_variable_scope: 'environment',
                _postman_exported_at: new Date().toISOString(),
                _postman_exported_using: 'Postman-Export-Script'
            };

            const filePath = path.join(postmanDir, `${envName.toLowerCase()}.postman_environment.json`);
            fs.writeFileSync(filePath, JSON.stringify(environment, null, 2));
            console.log(`✅ Postman ${envName} environment generated at: ${filePath}`);
        };

        // Save Environments separately
        createEnvironment('Development', 'http://localhost:3000/api/v1');
        createEnvironment('Staging', 'https://staging-api.example.com/api/v1');
        createEnvironment('Production', 'https://api.example.com/api/v1');
    }
);
