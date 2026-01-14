import { Command } from "commander";
import { ServicesRepository } from "../repositories/services-repository";
import { ServiceSettingsRepository } from "../repositories/service-settings-repository";

const program = new Command();
program.version("1.0.0").description("Edit projects");

program
    .command("add <serviceName> [nameValues]")
    .description("Create a new project")
    .action(async (serviceName: string, nameValues?: string) => {
        const { create } = ServicesRepository;
        const serviceId = await create(serviceName);
        if (!serviceId) throw new Error("Expect3ed serviceId to be set");

        console.log(`Service ${serviceName} created with Id: ${serviceId}`);

        const { create: createServiceSetting } = ServiceSettingsRepository;

        await Promise.all(
            (nameValues ?? "").split(",").map(async (nameValue: string) => {
                const [name, value] = nameValue.split("=").map((s) => s.trim());
                const newServiceSettingId = await createServiceSetting({
                    service_id: serviceId,
                    name,
                    value,
                });
                if (!newServiceSettingId)
                    throw new Error("Expected newServiceSettingId to be set");
            }),
        );

        process.exit(1);
    });
program.parse(process.argv);
