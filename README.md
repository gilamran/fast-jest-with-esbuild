# fast-jest-with-esbuild

Because jest is using barrel files it's very slow, and each test consumes ALL the imported code.
Using esbuild I'm bundling all the tests and the code into one big file, and give that to jest.
Making the tests run X10 faster.
