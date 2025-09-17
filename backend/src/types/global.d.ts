// Declaraciones de tipos para paquetes que no tienen tipos incluidos

declare module 'cloudinary' {
  export const v2: any;
  export default any;
}

declare module 'multer-storage-cloudinary' {
  interface CloudinaryStorageOptions {
    cloudinary: any;
    params?: any;
  }

  class CloudinaryStorage {
    constructor(options: CloudinaryStorageOptions);
    _handleFile(req: any, file: any, callback: (error?: any, info?: any) => void): void;
    _removeFile(req: any, file: any, callback: (error: Error) => void): void;
  }
  export = CloudinaryStorage;
}

declare module 'multer' {
  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }

  interface MulterFile extends File {}

  interface StorageEngine {
    _handleFile(req: any, file: File, callback: (error?: any, info?: Partial<File>) => void): void;
    _removeFile(req: any, file: File, callback: (error: Error) => void): void;
  }

  interface Options {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    fileFilter?: (req: any, file: File, callback: (error: Error | null, acceptFile: boolean) => void) => void;
  }

  function multer(options?: Options): any;
  export = multer;
  export const diskStorage: (options: any) => StorageEngine;
  export const memoryStorage: () => StorageEngine;
}

declare module 'mongoose' {
  import { Document, Schema, Model, Connection, Types } from 'mongoose';
  export * from 'mongoose';
  export { Document, Schema, Model, Connection, Types };
  
  // Agregar propiedades estáticas que faltan
  export function connect(uri: string, options?: any): Promise<typeof import('mongoose')>;
  export function disconnect(): Promise<void>;
  export const connection: Connection;
  export const model: <T = Document>(name: string, schema?: Schema, collection?: string) => Model<T>;
  
  // Agregar ConnectOptions
  interface ConnectOptions {
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
    useCreateIndex?: boolean;
    useFindAndModify?: boolean;
    bufferCommands?: boolean;
    bufferMaxEntries?: number;
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
    family?: number;
    authSource?: string;
    user?: string;
    pass?: string;
    dbName?: string;
    retryWrites?: boolean;
    w?: string | number;
    j?: boolean;
    readPreference?: string;
    readConcern?: any;
    maxIdleTimeMS?: number;
    minPoolSize?: number;
    maxIdleTimeMS?: number;
    serverApi?: any;
  }
  
  export { ConnectOptions };
}

declare module 'mongoose-paginate-v2' {
  import { Document, Model } from 'mongoose';
  
  interface PaginateOptions {
    select?: string | object;
    sort?: string | object;
    populate?: string | object | Array<string | object>;
    lean?: boolean;
    leanWithId?: boolean;
    limit?: number;
    page?: number;
    offset?: number;
  }

  interface PaginateResult<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    page?: number;
    totalPages: number;
    hasNextPage?: boolean;
    nextPage?: number | null;
    hasPrevPage?: boolean;
    prevPage?: number | null;
    pagingCounter?: number;
    meta?: any;
  }

  interface PaginateModel<T extends Document> extends Model<T> {
    paginate(query?: any, options?: PaginateOptions): Promise<PaginateResult<T>>;
  }

  function paginate(schema: any): void;
  export = paginate;
}

declare module 'dotenv' {
  interface DotenvConfigOptions {
    path?: string;
    encoding?: string;
    debug?: boolean;
  }

  interface DotenvConfigOutput {
    parsed?: { [key: string]: string };
    error?: Error;
  }

  function config(options?: DotenvConfigOptions): DotenvConfigOutput;
  export = config;
  export { config };
}

declare module 'passport' {
  interface Strategy {
    name?: string;
    authenticate(req: any, options?: any): any;
  }

  interface Authenticator {
    use(strategy: Strategy): this;
    serializeUser(fn: (user: any, done: (err: any, id?: any) => void) => void): this;
    deserializeUser(fn: (id: any, done: (err: any, user?: any) => void) => void): this;
    initialize(): any;
    session(): any;
    authenticate(strategy: string | string[], options?: any): any;
  }

  const passport: Authenticator;
  export = passport;
}

declare module 'passport-google-oauth20' {
  import { Strategy } from 'passport';
  
  interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
  }

  interface VerifyCallback {
    (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void): void;
  }

  class GoogleStrategy extends Strategy {
    constructor(options: StrategyOptions, verify: VerifyCallback);
  }

  export = GoogleStrategy;
  export { Strategy };
}

declare module 'express' {
  import { Request, Response, NextFunction, Router, Application } from 'express';
  export * from 'express';
  export { Request, Response, NextFunction, Router, Application };
  
  // Agregar propiedades estáticas que faltan
  function express(): Application;
  export = express;
  export const Router: () => Router;
  export const static: (root: string, options?: any) => any;
  export const json: (options?: any) => any;
  export const urlencoded: (options?: any) => any;
}

declare module 'cors' {
  interface CorsOptions {
    origin?: boolean | string | RegExp | (string | RegExp)[] | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  }

  function cors(options?: CorsOptions): any;
  export = cors;
}

declare module 'helmet' {
  interface HelmetOptions {
    contentSecurityPolicy?: boolean | any;
    crossOriginEmbedderPolicy?: boolean | any;
    crossOriginOpenerPolicy?: boolean | any;
    crossOriginResourcePolicy?: boolean | any;
    dnsPrefetchControl?: boolean | any;
    frameguard?: boolean | any;
    hidePoweredBy?: boolean | any;
    hsts?: boolean | any;
    ieNoOpen?: boolean | any;
    noSniff?: boolean | any;
    originAgentCluster?: boolean | any;
    permittedCrossDomainPolicies?: boolean | any;
    referrerPolicy?: boolean | any;
    xssFilter?: boolean | any;
  }

  function helmet(options?: HelmetOptions): any;
  export = helmet;
}

declare module 'morgan' {
  interface MorganOptions {
    immediate?: boolean;
    skip?: (req: any, res: any) => boolean;
    stream?: any;
  }

  function morgan(format: string, options?: MorganOptions): any;
  export = morgan;
}

declare module 'express-rate-limit' {
  interface RateLimitOptions {
    windowMs?: number;
    max?: number | ((req: any) => number);
    message?: string | object;
    statusCode?: number;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    skip?: (req: any, res: any) => boolean;
    keyGenerator?: (req: any, res: any) => string;
    handler?: (req: any, res: any) => void;
    onLimitReached?: (req: any, res: any, options: RateLimitOptions) => void;
  }

  function rateLimit(options?: RateLimitOptions): any;
  export = rateLimit;
}

declare module 'express-session' {
  interface SessionData {
    [key: string]: any;
  }

  interface SessionOptions {
    secret: string;
    name?: string;
    store?: any;
    cookie?: {
      secure?: boolean;
      httpOnly?: boolean;
      maxAge?: number;
      path?: string;
      domain?: string;
      sameSite?: boolean | 'lax' | 'strict' | 'none';
    };
    resave?: boolean;
    saveUninitialized?: boolean;
    rolling?: boolean;
    unset?: 'destroy' | 'keep';
  }

  function session(options?: SessionOptions): any;
  export = session;
}

declare module 'jsonwebtoken' {
  interface SignOptions {
    algorithm?: string;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    issuer?: string | string[];
    jwtid?: string;
    subject?: string;
    noTimestamp?: boolean;
    header?: object;
    keyid?: string;
    mutatePayload?: boolean;
  }

  interface VerifyOptions {
    algorithms?: string[];
    audience?: string | string[];
    clockTolerance?: number;
    issuer?: string | string[];
    ignoreExpiration?: boolean;
    ignoreNotBefore?: boolean;
    subject?: string;
    maxAge?: string | number;
    clockTimestamp?: number;
  }

  class JsonWebTokenError extends Error {
    name: 'JsonWebTokenError';
  }

  class TokenExpiredError extends Error {
    name: 'TokenExpiredError';
    expiredAt: Date;
  }

  function sign(payload: string | object | Buffer, secretOrPrivateKey: string | Buffer, options?: SignOptions): string;
  function verify(token: string, secretOrPublicKey: string | Buffer, options?: VerifyOptions): any;
  function decode(token: string, options?: any): any;

  export { sign, verify, decode, JsonWebTokenError, TokenExpiredError };
  export default { sign, verify, decode, JsonWebTokenError, TokenExpiredError };
}

declare module 'speakeasy' {
  interface TotpOptions {
    secret: string;
    encoding?: string;
    time?: number;
    step?: number;
    window?: number;
    digits?: number;
    algorithm?: string;
  }

  interface GenerateSecretOptions {
    name?: string;
    account?: string;
    length?: number;
    symbols?: boolean;
    qr_codes?: boolean;
    google_auth_qr?: boolean;
    otpauth_url?: boolean;
    issuer?: string;
  }

  interface VerifyOptions {
    secret: string;
    token: string;
    encoding?: string;
    time?: number;
    step?: number;
    window?: number;
    algorithm?: string;
  }

  export function generateSecret(options?: GenerateSecretOptions): any;
  export function generateOTP(options: TotpOptions): string;
  export function verifyOTP(options: VerifyOptions): boolean;
  export function timeUsed(options: TotpOptions): number;
  export function timeRemaining(options: TotpOptions): number;
  export const totp: {
    generateSecret(options?: GenerateSecretOptions): any;
    generate(options: TotpOptions): string;
    verify(options: VerifyOptions): boolean;
    timeUsed(options: TotpOptions): number;
    timeRemaining(options: TotpOptions): number;
  };
}

declare module 'argon2' {
  interface Options {
    type?: 0 | 1 | 2;
    memoryCost?: number;
    timeCost?: number;
    parallelism?: number;
    hashLength?: number;
    saltLength?: number;
    version?: number;
  }

  function hash(plain: string | Buffer, options?: Options): Promise<string>;
  function verify(hash: string, plain: string | Buffer, options?: Options): Promise<boolean>;
  function needsRehash(hash: string, options?: Options): boolean;

  export { hash, verify, needsRehash };
  export default { hash, verify, needsRehash };
}

declare module 'socket.io' {
  interface Server {
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): this;
    to(room: string): any;
    in(room: string): any;
  }

  interface Socket {
    id: string;
    handshake: any;
    rooms: Set<string>;
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): this;
    join(room: string): this;
    leave(room: string): this;
    to(room: string): any;
    in(room: string): any;
  }

  class Server {
    constructor(server?: any, options?: any);
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): this;
    to(room: string): any;
    in(room: string): any;
  }

  export = Server;
  export { Server };
}

declare module 'web-push' {
  interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  interface SendOptions {
    TTL?: number;
    headers?: { [key: string]: string };
    gcmAPIKey?: string;
    vapidDetails?: {
      subject: string;
      publicKey: string;
      privateKey: string;
    };
  }

  function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  function sendNotification(subscription: PushSubscription, payload: string | Buffer, options?: SendOptions): Promise<any>;
  function generateVAPIDKeys(): { publicKey: string; privateKey: string };

  export { setVapidDetails, sendNotification, generateVAPIDKeys };
  export default { setVapidDetails, sendNotification, generateVAPIDKeys };
}

declare module 'csv-parser' {
  interface Options {
    headers?: boolean | string[] | ((headers: string[]) => string[]);
    skipEmptyLines?: boolean;
    skipLinesWithError?: boolean;
    mapHeaders?: ({ header }: { header: string }) => string;
    mapValues?: ({ header, index, value }: { header: string; index: number; value: any }) => any;
  }

  function csvParser(options?: Options): any;
  export = csvParser;
}

declare module 'googleapis' {
  interface GoogleApis {
    google: any;
  }

  const googleapis: GoogleApis;
  export = googleapis;
}

declare module 'tesseract.js' {
  interface TesseractOptions {
    logger?: (m: any) => void;
    workerPath?: string;
    langPath?: string;
    corePath?: string;
  }

  interface RecognizeResult {
    data: {
      text: string;
      confidence: number;
      words: any[];
      lines: any[];
      blocks: any[];
      paragraphs: any[];
    };
  }

  function createWorker(options?: TesseractOptions): Promise<any>;
  function recognize(image: string | Buffer, languages?: string | string[], options?: TesseractOptions): Promise<RecognizeResult>;

  export { createWorker, recognize };
  export default { createWorker, recognize };
}

declare module 'cheerio' {
  interface CheerioAPI {
    load(html: string | Buffer, options?: any): any;
  }

  const cheerio: CheerioAPI;
  export = cheerio;
}

declare module 'nodemailer' {
  interface Transporter {
    sendMail(mailOptions: any): Promise<any>;
  }

  interface CreateTransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }

  function createTransporter(options: CreateTransportOptions): Transporter;
  function createTransport(options: CreateTransportOptions): Transporter;
  export { createTransporter, createTransport };
  export default { createTransporter, createTransport };
}

// Extender el namespace Express para Multer
declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }
}

// Extender el namespace nodemailer
declare namespace nodemailer {
  interface Transporter {
    sendMail(mailOptions: any): Promise<any>;
  }

  interface CreateTransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }

  function createTransport(options: CreateTransportOptions): Transporter;
}