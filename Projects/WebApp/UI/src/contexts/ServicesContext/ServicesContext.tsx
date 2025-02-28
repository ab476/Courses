import { createContext, useContext } from "react";
import { AsymmetricEncryption } from "../../services/AsymmetricEncryption";

export interface IServices {
  encryptionService: AsymmetricEncryption;
  // other services can be added here
}

export const ServicesContext = createContext<IServices | null>(null);

export const useServices = (): IServices => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useServices must be used within a ServicesProvider");
  }
  return context;
};
