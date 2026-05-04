import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual
} from "node:crypto";

export const API_TOKEN_HASH_VERSION = "api-token-scrypt-v1";

export type ApiTokenHashOptions = {
  saltBytes?: number;
  keyLength?: number;
  cost?: number;
  blockSize?: number;
  parallelization?: number;
};

export type ApiTokenHashParameters = Required<ApiTokenHashOptions>;

export type ParsedApiTokenHash = {
  version: typeof API_TOKEN_HASH_VERSION;
  parameters: ApiTokenHashParameters;
  salt: Buffer;
  hash: Buffer;
};

const DEFAULT_HASH_PARAMETERS: ApiTokenHashParameters = {
  saltBytes: 16,
  keyLength: 32,
  cost: 16384,
  blockSize: 8,
  parallelization: 1
};

export async function hashApiToken(
  token: string,
  options: ApiTokenHashOptions = {}
): Promise<string> {
  assertApiToken(token);

  const parameters = normalizeHashParameters(options);
  const salt = randomBytes(parameters.saltBytes);
  const hash = await deriveApiTokenHash(token, salt, parameters);

  return [
    API_TOKEN_HASH_VERSION,
    parameters.cost,
    parameters.blockSize,
    parameters.parallelization,
    parameters.keyLength,
    salt.toString("base64url"),
    hash.toString("base64url")
  ].join("$");
}

export async function verifyApiToken(
  token: string,
  storedHash: string
): Promise<boolean> {
  if (!token) {
    return false;
  }

  const parsedHash = parseApiTokenHash(storedHash);

  if (!parsedHash) {
    return false;
  }

  const candidateHash = await deriveApiTokenHash(
    token,
    parsedHash.salt,
    parsedHash.parameters
  );

  if (candidateHash.length !== parsedHash.hash.length) {
    return false;
  }

  return timingSafeEqual(candidateHash, parsedHash.hash);
}

export function parseApiTokenHash(
  storedHash: string
): ParsedApiTokenHash | null {
  const [
    version,
    cost,
    blockSize,
    parallelization,
    keyLength,
    salt,
    hash
  ] = storedHash.split("$");

  if (
    version !== API_TOKEN_HASH_VERSION ||
    !cost ||
    !blockSize ||
    !parallelization ||
    !keyLength ||
    !salt ||
    !hash
  ) {
    return null;
  }

  const parameters = parseHashParameters({
    cost,
    blockSize,
    parallelization,
    keyLength
  });

  if (!parameters) {
    return null;
  }

  const saltBuffer = Buffer.from(salt, "base64url");
  const hashBuffer = Buffer.from(hash, "base64url");

  if (saltBuffer.length === 0 || hashBuffer.length !== parameters.keyLength) {
    return null;
  }

  return {
    version: API_TOKEN_HASH_VERSION,
    parameters,
    salt: saltBuffer,
    hash: hashBuffer
  };
}

async function deriveApiTokenHash(
  token: string,
  salt: Buffer,
  parameters: ApiTokenHashParameters
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      token,
      salt,
      parameters.keyLength,
      {
        cost: parameters.cost,
        blockSize: parameters.blockSize,
        parallelization: parameters.parallelization
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey as Buffer);
      }
    );
  });
}

function normalizeHashParameters(
  options: ApiTokenHashOptions
): ApiTokenHashParameters {
  const parameters = {
    ...DEFAULT_HASH_PARAMETERS,
    ...options
  };

  assertPositiveInteger(parameters.saltBytes, "saltBytes");
  assertPositiveInteger(parameters.keyLength, "keyLength");
  assertPositiveInteger(parameters.cost, "cost");
  assertPositiveInteger(parameters.blockSize, "blockSize");
  assertPositiveInteger(parameters.parallelization, "parallelization");

  if (!isPowerOfTwo(parameters.cost) || parameters.cost <= 1) {
    throw new Error("API token hash cost must be a power of two greater than 1.");
  }

  return parameters;
}

function parseHashParameters(input: {
  cost: string;
  blockSize: string;
  parallelization: string;
  keyLength: string;
}): ApiTokenHashParameters | null {
  try {
    return normalizeHashParameters({
      cost: parsePositiveInteger(input.cost),
      blockSize: parsePositiveInteger(input.blockSize),
      parallelization: parsePositiveInteger(input.parallelization),
      keyLength: parsePositiveInteger(input.keyLength)
    });
  } catch {
    return null;
  }
}

function assertApiToken(token: string) {
  if (token.length === 0) {
    throw new Error("API token must not be empty.");
  }
}

function parsePositiveInteger(value: string): number | undefined {
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : undefined;
}

function assertPositiveInteger(
  value: number | undefined,
  name: string
): asserts value is number {
  if (value === undefined || !Number.isInteger(value) || value <= 0) {
    throw new Error(`API token hash ${name} must be a positive integer.`);
  }
}

function isPowerOfTwo(value: number): boolean {
  return (value & (value - 1)) === 0;
}
