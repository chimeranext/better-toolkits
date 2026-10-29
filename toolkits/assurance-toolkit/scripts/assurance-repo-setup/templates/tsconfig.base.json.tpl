{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "typeRoots": ["./node_modules/@types"],
    "types": ["node"]
  },
  "include": [
    "stderr/adapters/**/*.ts",
    "prds/adapters/**/*.ts",
    "opencode-globals.d.ts"
  ]
}
