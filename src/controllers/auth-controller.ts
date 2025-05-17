import {UserService} from "../services/user-service";
import {validateRequest} from "../utils";

export class AuthController {
    private service: UserService;

    constructor(service: UserService) {
        this.service = service;
    }

    public register = (request: string) => {
        let result: {name: string, index: string, error: boolean, errorMessage: string} = {
            name: '',
            index: '',
            error: false,
            errorMessage: '',
        };

        try {
            const { name, password } = validateRequest<{name: string, password: string}>(request, {
                name: '',
                password: '',
            });

            this.validateUsername(name);

            const user = this.service.register(name, password);

            result.name = user.name;
            result.index = user.id;

            return result;
        } catch (e) {
            console.log(e instanceof Error, e);

            if (e instanceof Error) {
                result.error = true;
                result.errorMessage = e.message;
                return result;
            }

            return result;
        }
    }

    private validateUsername = (username: string): void => {
        if (
            !(
                username &&
                username.trim().length >= 5 &&
                username.trim().length <= 25 &&
                /^[a-zA-Z0-9_]+$/.test(username)
            )
        ) {
            throw new Error('Invalid username');
        }
    }
}