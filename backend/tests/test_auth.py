"""
Authentication Tests
Tests for Supabase-backed auth endpoints: /me, /logout, and removed legacy endpoints.
"""

import pytest
from httpx import AsyncClient


class TestProtectedEndpoints:
    """Tests for authenticated endpoints"""

    @pytest.mark.asyncio
    async def test_get_current_user_success(
        self,
        client: AsyncClient,
        test_user_token: str,
        test_user
    ):
        """Test getting current user info with valid token"""
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user["email"]
        assert data["full_name"] == test_user["full_name"]

    @pytest.mark.asyncio
    async def test_get_current_user_no_token(self, client: AsyncClient):
        """Test accessing protected endpoint without token fails"""
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self, client: AsyncClient):
        """Test accessing protected endpoint with invalid token fails"""
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"}
        )
        assert response.status_code == 401


class TestLogout:
    """Tests for logout endpoint"""

    @pytest.mark.asyncio
    async def test_logout_success(
        self,
        client: AsyncClient,
        test_user_token: str
    ):
        """Test successful logout"""
        response = await client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_logout_without_token(self, client: AsyncClient):
        """Test logout without token fails"""
        response = await client.post("/api/v1/auth/logout")
        assert response.status_code == 401


class TestAuthEndpoints:
    """Tests for registration, login, and refresh endpoints"""

    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient):
        """POST /register should create a user and return tokens"""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "Password123!",
                "full_name": "New User"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == "newuser@example.com"
        assert data["user"]["full_name"] == "New User"

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient):
        """POST /login should authenticate user and return tokens"""
        # First register
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "loginuser@example.com",
                "password": "Password123!",
                "full_name": "Login User"
            }
        )
        # Login using form data (OAuth2 standard)
        response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": "loginuser@example.com",
                "password": "Password123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "loginuser@example.com"

    @pytest.mark.asyncio
    async def test_refresh_success(self, client: AsyncClient):
        """POST /refresh should exchange valid refresh token for new access token"""
        reg_resp = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "refreshuser@example.com",
                "password": "Password123!",
                "full_name": "Refresh User"
            }
        )
        tokens = reg_resp.json()
        refresh_token = tokens["refresh_token"]

        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

