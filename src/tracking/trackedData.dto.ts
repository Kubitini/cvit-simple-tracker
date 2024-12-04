import { IsInt, IsOptional, IsPositive } from 'class-validator';

/**
 * To simplify things, I have decided to be taking into account
 * only the cases when the count is actually in the root of the json payload.
 */
export class TrackedDataDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  count?: number;
}
