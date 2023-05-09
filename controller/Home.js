exports.home = function (req, res) {
  const data = {
    message: "Welcome to the Home Page",
    description: "This is the home page.",
  };
  res.render("home", { data: data });
};
