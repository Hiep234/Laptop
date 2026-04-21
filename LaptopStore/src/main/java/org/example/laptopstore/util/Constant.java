package org.example.laptopstore.util;

public class Constant {
    // HTTP Status Codes
    public static final int SUCCESS = 200;
    public static final int NO_CONTENT = 204;
    public static final int BAD_REQUEST = 400;
    public static final int NOT_FOUND = 404;
    public static final int INTERNAL_SERVER_ERROR = 500;

    // Success Messages
    public static final String SUCCESS_MESSAGE = "Success";
    public static final String CREATE_NEW_TOKEN = "Create token success";

    public static final String PASSWORD_CHANGE_SUCESSFUL = "Password changed successfully";
    // Error Messages
    public static final String REQUEST_FAILD = "Request failed";
    public static final String USERNAME_EXIST = "Username already exists";
    public static final String BALANCE = "Balance is not enough";
    public static final String EMAIL_EXIST = "Email already exists";
    public static final String DEFAULT_ROLE_NOT_VALID = "Default role not found";
    public static final String USER_NOT_VALID = "User not found";
    public static final String INVALID_PASSWORD_FAIL = "Invalid password";
    public static final String NO_CONTENT_MESSAGE = "No content found";
    public static final String ERROR_LIST_EMPTY_MESSAGE = "List is empty";
    public static final String PAYMENT_NOT_VALID = "Payment not found";
    public static final String EMAIL_REQUIRED_MESSAGE = "Email is required";
    public static final String ERROR_TOKEN_INVALID_MESSAGE = "Token is invalid";
    public static final String NOT_FOUND_ROLE = "Role not found";
    public static final String VIP_TYPE_ERROR = "Type not found";
    public static final String VIP_PACKAGE_ERROR = "Package not found";
    public static final String NOT_ENOUGH_QUANTITY_SYSTEM ="Not enough quantity";
    //Genre Messages
    public static final String GENRE_NOT_FOUND = "Genre not found";
    public static final String GENRE_NAME_REQUIRED = "Genre name is required";
    public static final String GENRE_EXIST = "Genre name already exists";

    // Movie Messages
    public static final String MOVIE_NOT_FOUND = "Movie not found";
    public static final String TITLE_REQUIRED = "Title is required";
    public static final String SIZE_TITLE = "Title must not exceed {max} characters.";
    public static final String SIZE_DESCRIPTION = "Description must not exceed {max} characters.";
    public static final String COUNTRY_REQUIRED = "Country is required";
    public static final String MOVIE_ID_NOT_FOUND = "Movie ID is required";
    // Actor Messages
    public static final String ACTOR_NAME_REQUIRED = "Actor name is required";
    public static final String SIZE_NAME = "Name must not exceed {max} characters.";

    //Episode Messages
    public static final String EPISODE_NOT_FOUND = "Episode not found";
    public static final String EPISODE_NUMBER_EXIST = "Episode number already exists";

    //favorite Messages
    public static final String MOVIE_ALREADY_FAVORITE = "Movie already in favorites";
    public static final String MOVIE_NOT_FAVORITE = "Movie not in favorites";

    //comment Messages
    public static final String COMMENT_NOT_FOUND = "Comment not found";
    public static final String USER_NOT_MATCH = "User not match";
    public static final String COMMENT_IS_LIKE = "Comment is already liked";
    public static final String COMMENT_IS_DISLIKE = "Comment is already disliked";

    // Comment like/dislike messages
    public static final String COMMENT_NOT_LIKED_YET = "You haven't liked this comment yet.";
    public static final String COMMENT_NOT_DISLIKED_YET = "You haven't disliked this comment yet.";
    public static final String REMOVE_LIKE_SUCCESS = "Removed like successfully.";
    public static final String REMOVE_DISLIKE_SUCCESS = "Removed dislike successfully.";

    // Watch History Messages
    public static final String HISTORY_NOT_FOUND = "History not found";
    // JWT Constants
    public static final String SUB = "sub";
    public static final String NO_TOKEN = "NO_TOKEN";
    public static final String APPLICATION_NAME = "Movies";
    public static final String SCOPE = "scope";
    public static final String ANONYMOUS_USER = "anonymousUser";
}
