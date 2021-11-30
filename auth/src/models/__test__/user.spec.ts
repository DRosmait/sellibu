import { User } from "..";

describe("User model", () => {
  it("has 'id' field.", async () => {
    const user = User.build({
      email: "test@test.com",
      password: "somepassword",
      userName: "Test",
    });
    await user.save();

    const userFromDB = await User.findById(user.id);

    expect(userFromDB!.id).toBeDefined();
  });

  it("implements optimistic concurrency control", async () => {
    const user = User.build({
      email: "test@test.com",
      password: "password",
      userName: "Max Mustermann",
    });
    await user.save();

    const firstInstance = await User.findById(user.id);
    const secondInstance = await User.findById(user.id);

    const firstSave = async () => {
      firstInstance!.set({ password: "first change" });
      await firstInstance!.save();
    };

    const secondSave = async () => {
      secondInstance!.set({ password: "first change" });
      await secondInstance!.save();
    };

    await firstSave();
    expect(firstInstance!.version).toEqual(1);

    await expect(secondSave).rejects.toThrow();
    expect(secondInstance!.version).toEqual(0);
  });

  it("increments version number on each save.", async () => {
    const user = User.build({
      email: "test@test.com",
      password: "password",
      userName: "Max Mustermann",
    });

    await user.save();
    expect(user.version).toEqual(0);

    await user.save();
    expect(user.version).toEqual(1);

    await user.save();
    expect(user.version).toEqual(2);

    await user.save();
    expect(user.version).toEqual(3);
  });
});
