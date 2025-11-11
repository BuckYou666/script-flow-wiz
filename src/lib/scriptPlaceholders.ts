interface ScriptReplacementData {
  leadFirstName?: string;
  leadFullName?: string;
  repFirstName?: string;
  repFullName?: string;
  businessName?: string;
  leadMagnetName?: string;
}

/**
 * Replaces placeholders in script content with actual values
 * @param scriptContent The script content with placeholders
 * @param data The replacement data
 * @returns Script content with placeholders replaced
 */
export const replaceScriptPlaceholders = (
  scriptContent: string,
  data: ScriptReplacementData
): string => {
  if (!scriptContent) return scriptContent;

  let result = scriptContent;

  // Replace {LeadFirstName}
  if (data.leadFirstName) {
    result = result.replace(/{LeadFirstName}/g, data.leadFirstName);
  } else if (data.leadFullName) {
    // Extract first name from full name (first word before space)
    const firstName = data.leadFullName.split(' ')[0];
    result = result.replace(/{LeadFirstName}/g, firstName);
  } else {
    // Fallback to "there" for a neutral greeting
    result = result.replace(/{LeadFirstName}/g, "there");
  }

  // Replace {RepName}
  if (data.repFirstName) {
    result = result.replace(/{RepName}/g, data.repFirstName);
  } else if (data.repFullName) {
    // Use full name as fallback
    result = result.replace(/{RepName}/g, data.repFullName);
  } else {
    // Fallback to company name
    result = result.replace(/{RepName}/g, "someone from A-Tech Technologies");
  }

  // Replace {BusinessName}
  if (data.businessName) {
    result = result.replace(/{BusinessName}/g, data.businessName);
  }

  // Replace {lead_magnet_name}
  if (data.leadMagnetName) {
    result = result.replace(/{lead_magnet_name}/g, data.leadMagnetName);
  }

  return result;
};

/**
 * Extract first name from a full name
 * @param fullName The full name
 * @returns The first name (first word)
 */
export const extractFirstName = (fullName: string): string => {
  if (!fullName) return '';
  return fullName.split(' ')[0].trim();
};

/**
 * Get the actual replacement values that will be used
 * @param data The replacement data
 * @returns Object with the actual values that will be used
 */
export const getReplacementValues = (data: ScriptReplacementData) => {
  // Lead first name logic
  let leadFirstName = "there";
  if (data.leadFirstName) {
    leadFirstName = data.leadFirstName;
  } else if (data.leadFullName) {
    leadFirstName = data.leadFullName.split(' ')[0];
  }

  // Rep name logic
  let repName = "someone from A-Tech Technologies";
  if (data.repFirstName) {
    repName = data.repFirstName;
  } else if (data.repFullName) {
    repName = data.repFullName;
  }

  return {
    leadFirstName,
    repName,
    businessName: data.businessName || null,
    leadMagnetName: data.leadMagnetName || null,
  };
};
