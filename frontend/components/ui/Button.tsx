"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const variantClasses = {
            primary: "btn-primary",
            secondary: "btn-secondary",
            success: "btn-success",
            danger: "btn-danger",
            ghost: "btn-ghost",
        };

        const sizeClasses = {
            sm: "px-3 py-1.5 text-xs",
            md: "px-5 py-2.5 text-sm",
            lg: "px-7 py-3.5 text-base",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "btn",
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                disabled={disabled || isLoading}
                aria-busy={isLoading}
                {...props}
            >
                {isLoading ? (
                    <span className="spinner" aria-hidden="true" />
                ) : (
                    leftIcon && <span aria-hidden="true">{leftIcon}</span>
                )}
                {children}
                {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
