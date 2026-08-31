/**
 * The subpath this app is served from. It is the single source of truth for the
 * value: next.config.ts reads it for `basePath`, and anything that has to build
 * a public asset URL by hand reads it too.
 *
 * next/image needs it because it does not prefix basePath onto the `url` query
 * param it hands the optimizer, so a bare "/hero.jpg" resolves to a file that
 * does not exist and the optimizer answers 400.
 */
export const BASE_PATH = '/earn';
