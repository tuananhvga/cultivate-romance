import type { HttpClient } from "../client";

/** POST /pub/farm?a=harvest */
export async function harvest(client: HttpClient, landIndexs: number): Promise<unknown> {
  return client.post("pub/farm", { landIndexs }, { params: { a: "harvest" } });
}
