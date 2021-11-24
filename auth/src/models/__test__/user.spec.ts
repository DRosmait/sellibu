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
});
