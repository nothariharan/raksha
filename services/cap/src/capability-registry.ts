import { CAPCapability } from "@raksha/schemas";
import { DEFAULT_CAPABILITIES } from "@raksha/cap-sdk";

export class CapabilityRegistry {
  private capabilities: Map<string, CAPCapability> = new Map();

  constructor() {
    for (const cap of DEFAULT_CAPABILITIES) {
      this.capabilities.set(cap.name, cap);
    }
  }

  list(): CAPCapability[] {
    return Array.from(this.capabilities.values());
  }

  get(name: string): CAPCapability | null {
    return this.capabilities.get(name) || null;
  }

  register(capability: CAPCapability): void {
    this.capabilities.set(capability.name, capability);
  }
}

export const capabilityRegistry = new CapabilityRegistry();
