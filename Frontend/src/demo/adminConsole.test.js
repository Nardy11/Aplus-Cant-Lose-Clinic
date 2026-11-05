/*
 * Drives the real admin console against the demo mock API (no backend, no browser).
 *   npm test -- --watchAll=false src/demo/adminConsole.test.js
 */
process.env.REACT_APP_DEMO = "true";
process.env.RTL_SKIP_AUTO_CLEANUP = "true"; // RTL is required inside each test, so we clean up ourselves

let cleanupLast = () => {};
afterEach(() => cleanupLast());

jest.mock("../App", () => {
  const React = require("react");
  return { SnackbarContext: React.createContext(() => {}) };
});

// Every test gets a pristine mock "server": modules are re-required together so React stays a single copy.
async function mountConsole(section = "") {
  jest.resetModules();
  sessionStorage.clear();
  const React = require("react");
  const { Provider } = require("react-redux");
  const { MemoryRouter } = require("react-router-dom");
  const rtl = require("@testing-library/react");
  const userEvent = require("@testing-library/user-event").default;
  require("./install");
  const store = require("../store").default;
  const { loginGuest } = require("../features/userSlice");
  await store.dispatch(loginGuest({ username: "admin.demo", password: "Demo@1234" }));
  const Admin = require("../components/Adminstrator/Admin").default;
  rtl.render(
    React.createElement(
      Provider,
      { store },
      React.createElement(MemoryRouter, { initialEntries: [`/Home${section}`] }, React.createElement(Admin))
    )
  );
  cleanupLast = rtl.cleanup;
  await rtl.screen.findByRole("heading", { level: 1 });
  return { store, userEvent, ...rtl };
}

test("overview leads with the first join request and real counts", async () => {
  const { screen } = await mountConsole();
  expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
  expect(screen.getByText("Needs your decision")).toBeTruthy();
  expect(screen.getByText("Layla Mansour")).toBeTruthy();
  expect(screen.getByText(/more requests? waiting after this one/i)).toBeTruthy();
});

test("patients table survives a patient with no emergency contact", async () => {
  const { screen, within } = await mountConsole("?section=patients");
  const table = await screen.findByRole("table");
  expect(within(table).getByText("Youssef Hamdy")).toBeTruthy();
  expect(within(table).getAllByText("Not provided").length).toBeGreaterThan(0);
  expect(within(table).getAllByText("Gold").length).toBeGreaterThan(0);
});

test("patient search filters and shows an empty result", async () => {
  const { screen, userEvent, waitFor } = await mountConsole("?section=patients");
  const box = await screen.findByLabelText("Search patients");
  await userEvent.type(box, "salma");
  await waitFor(() => expect(screen.queryByText("Youssef Hamdy")).toBeNull());
  expect(screen.getByText("Salma Eid")).toBeTruthy();
  await userEvent.clear(box);
  await userEvent.type(box, "zzzz");
  expect(await screen.findByText("No patients match your search")).toBeTruthy();
});

test("accepting a request moves the doctor to the doctors list", async () => {
  const { store, screen, within, userEvent, waitFor } = await mountConsole("?section=requests");
  const { pdoctors, jdoctors } = store.getState().admin;
  const pendingBefore = pdoctors.length;
  const joinedBefore = jdoctors.length;
  const card = (await screen.findByText("Amr Gaber")).closest("article");
  await userEvent.click(within(card).getByRole("button", { name: /accept/i }));
  await waitFor(() => expect(store.getState().admin.pdoctors.length).toBe(pendingBefore - 1));
  await waitFor(() => expect(store.getState().admin.jdoctors.length).toBe(joinedBefore + 1));
  expect(screen.queryByText("Amr Gaber")).toBeNull();
});

test("declining asks for confirmation first", async () => {
  const { store, screen, within, userEvent, waitFor } = await mountConsole("?section=requests");
  const n = store.getState().admin.pdoctors.length;
  const card = (await screen.findByText("Rana Habib")).closest("article");
  await userEvent.click(within(card).getByRole("button", { name: /decline/i }));
  expect(store.getState().admin.pdoctors.length).toBe(n);
  await userEvent.click(await screen.findByRole("button", { name: "Decline request" }));
  await waitFor(() => expect(store.getState().admin.pdoctors.length).toBe(n - 1));
});

test("removing a patient needs confirmation and updates the list", async () => {
  const { screen, userEvent, waitFor } = await mountConsole("?section=patients");
  await userEvent.click(await screen.findByRole("button", { name: "Remove Farah Naguib" }));
  await userEvent.click(await screen.findByRole("button", { name: "Remove patient" }));
  await waitFor(() => expect(screen.queryByText("Farah Naguib")).toBeNull());
});

test("packages can be edited and added", async () => {
  const { screen, userEvent, waitFor } = await mountConsole("?section=packages");
  await userEvent.click((await screen.findAllByRole("button", { name: /^Edit/ }))[0]);
  const rate = await screen.findByLabelText("Price per year (EGP)");
  await userEvent.clear(rate);
  await userEvent.type(rate, "3900");
  await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(await screen.findByText("EGP 3,900")).toBeTruthy();
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

  await userEvent.click(screen.getAllByRole("button", { name: /New package/ })[0]);
  await userEvent.type(await screen.findByLabelText("Package name"), "Bronze");
  await userEvent.type(screen.getByLabelText("Price per year (EGP)"), "1800");
  await userEvent.type(screen.getByLabelText("Doctor visits discount (%)"), "20");
  await userEvent.type(screen.getByLabelText("Medicine discount (%)"), "10");
  await userEvent.type(screen.getByLabelText("Family members discount (%)"), "5");
  await userEvent.click(screen.getByRole("button", { name: "Add package" }));
  expect(await screen.findByText("Bronze")).toBeTruthy();
});

test("administrators: a strong password adds, and you cannot remove yourself", async () => {
  const { screen, userEvent } = await mountConsole("?section=team");
  expect(await screen.findByText("You")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Remove admin.demo" })).toBeNull();

  await userEvent.type(screen.getByLabelText("Username"), "ops.hala");
  await userEvent.type(screen.getByLabelText("Password"), "Strong@Pass1");
  await userEvent.click(screen.getByRole("button", { name: "Add administrator" }));
  expect(await screen.findByText("ops.hala")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Remove ops.hala" })).toBeTruthy();
});

test("createAdmin surfaces the server reason for a weak password or a taken username", async () => {
  const { store } = await mountConsole("?section=team");
  const { createAdmin } = require("../features/adminSlice");
  const weak = await store.dispatch(createAdmin({ username: "ops.weak", password: "short" }));
  expect(weak.type).toMatch(/rejected$/);
  expect(weak.payload).toMatch(/too weak/i);
  const taken = await store.dispatch(createAdmin({ username: "admin.demo", password: "Strong@Pass1" }));
  expect(taken.payload).toMatch(/already taken/i);
});
