const url = (p: string) => process.env["NEXT_PUBLIC_TEST_URL"] + p;
const make = (p: string) => ({
    path: p,
    url: url(p),
    URL: () => new URL(url(p))
});
export const paths = {
    ...make(""),
    login: {
        ...make("" + "/login")
    },
    blog: {
        GET: make("" + "/blog"),
        POST: make("" + "/blog"),
        PUT: make("" + "/blog"),
        slug: (slug: string) => ({
            ...make(slug ? "" + "/blog" + ("/" + slug) : "" + "/blog"),
            POST: make(slug ? "" + "/blog" + ("/" + slug) : "" + "/blog"),
            PUT: make(slug ? "" + "/blog" + ("/" + slug) : "" + "/blog"),
            blogComponentId: (blogComponentId: string) => ({
                ...make((slug ? "" + "/blog" + ("/" + slug) : "" + "/blog") + ("/" + blogComponentId))
            })
        })
    },
    userSettings: {
        ...make("" + "/userSettings")
    }
};
