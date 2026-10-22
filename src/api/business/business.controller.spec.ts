import { Test, TestingModule } from "@nestjs/testing";
import { BusinessController } from "./business.controller.js";

describe("BusinessController", () => {
  let controller: BusinessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessController],
    }).compile();

    controller = module.get<BusinessController>(BusinessController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
