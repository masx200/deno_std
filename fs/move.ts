// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { isSubdir } from "./_util.ts";

const EXISTS_ERROR = new Deno.errors.AlreadyExists("dest already exists.");

interface MoveOptions {
  overwrite?: boolean;
}

/**
 * Moves a file or directory.
 *
 * @example
 * ```ts
 * import { move } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * move("./foo", "./bar"); // returns a promise
 * ```
 */
export async function move(
  src: string | URL,
  dest: string | URL,
  { overwrite = false }: MoveOptions = {},
) {
  const srcStat = await Deno.stat(src);

  if (srcStat.isDirectory && isSubdir(src, dest)) {
    throw new Error(
      `Cannot move '${src}' to a subdirectory of itself, '${dest}'.`,
    );
  }

  if (overwrite) {
    try {
      await Deno.remove(dest, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  } else {
    try {
      await Deno.lstat(dest);
      return Promise.reject(EXISTS_ERROR);
    } catch {
      // Do nothing...
    }
  }

  await Deno.rename(src, dest);
}

/**
 * Moves a file or directory synchronously.
 * @example
 * ```ts
 * import { moveSync } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * moveSync("./foo", "./bar"); // void
 * ```
 */
export function moveSync(
  src: string | URL,
  dest: string | URL,
  { overwrite = false }: MoveOptions = {},
) {
  const srcStat = Deno.statSync(src);

  if (srcStat.isDirectory && isSubdir(src, dest)) {
    throw new Error(
      `Cannot move '${src}' to a subdirectory of itself, '${dest}'.`,
    );
  }

  if (overwrite) {
    try {
      Deno.removeSync(dest, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  } else {
    try {
      Deno.lstatSync(dest);
      throw EXISTS_ERROR;
    } catch (error) {
      if (error === EXISTS_ERROR) {
        throw error;
      }
    }
  }

  Deno.renameSync(src, dest);
}
