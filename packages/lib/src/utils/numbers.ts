// Copy from @ethersproject/bignumber (function are not exported)

import { BN                      } from "bn.js";
import { BigNumberish, BigNumber } from "@ethersproject/bignumber";

export function toHex(value: string | BN): string {

    // For BN, call on the hex string
    if (typeof(value) !== "string") {
        return toHex(value.toString(16));
    }

    // If negative, prepend the negative sign to the normalized positive value
    if (value[0] === "-") {
        // Strip off the negative sign
        value = value.substring(1);

        // Cannot have multiple negative signs (e.g. "--0x04")
        // if (value[0] === "-") { logger.throwArgumentError("invalid hex", "value", value); }

        // Call toHex on the positive component
        value = toHex(value);

        // Do not allow "-0x00"
        if (value === "0x00") { return value; }

        // Negate the value
        return "-" + value;
    }

    // Add a "0x" prefix if missing
    if (value.substring(0, 2) !== "0x") { value = "0x" + value; }

    // Normalize zero
    if (value === "0x") { return "0x00"; }

    // Make the string even length
    if (value.length % 2) { value = "0x0" + value.substring(2); }

    // Trim to smallest even-length string
    while (value.length > 4 && value.substring(0, 4) === "0x00") {
        value = "0x" + value.substring(4);
    }

    return value;
}

export function toBigNumber(value: BN): BigNumber {
    return BigNumber.from(toHex(value));
}

export function toBN(value: BigNumberish): BN {
    const hex = BigNumber.from(value).toHexString();
    if (hex[0] === "-") {
        return (new BN("-" + hex.substring(3), 16));
    }
    return new BN(hex.substring(2), 16);
}