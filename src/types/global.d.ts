// prettier-ignore
{
  /**
   * Here must be vars, otherwise the typescript will NOT offer it in globalThis!
   * See the test/envs folder.
   */
  declare var redisHost: string; // eslint-disable-line
  declare var redisPort: number; // eslint-disable-line
}
