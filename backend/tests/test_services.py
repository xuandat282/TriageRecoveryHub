"""Unit tests for business logic and services."""
import pytest

from app.services import _fallback_analysis


class TestFallbackAnalysis:
    """Test the fallback analysis function."""
    
    def test_technical_category_bug(self):
        """Test that bug-related content is categorized as Technical."""
        result = _fallback_analysis("My application has a bug that crashes on startup")
        
        assert result["category"] == "Technical"
        assert result["urgency"] == "High"
    
    def test_technical_category_error(self):
        """Test that error-related content is categorized as Technical."""
        result = _fallback_analysis("I'm getting an error message when I try to login")
        
        assert result["category"] == "Technical"
        assert result["urgency"] == "High"
    
    def test_billing_category(self):
        """Test that billing-related content is categorized correctly."""
        result = _fallback_analysis("I was charged twice for my subscription")
        
        assert result["category"] == "Billing"
        assert result["urgency"] == "Medium"
    
    def test_billing_refund(self):
        """Test refund requests are categorized as Billing."""
        result = _fallback_analysis("I need a refund for my last payment")
        
        assert result["category"] == "Billing"
        assert result["urgency"] == "Medium"
    
    def test_account_category_login(self):
        """Test login issues are categorized as Account."""
        result = _fallback_analysis("I can't login to my account")
        
        assert result["category"] == "Account"
        assert result["urgency"] == "Medium"
    
    def test_account_category_password(self):
        """Test password issues are categorized as Account."""
        result = _fallback_analysis("I forgot my password and need to reset it")
        
        assert result["category"] == "Account"
        assert result["urgency"] == "Medium"
    
    def test_spam_detection(self):
        """Test spam content is detected."""
        result = _fallback_analysis("You've won a FREE Norton antivirus! Claim your prize now!")
        
        assert result["category"] == "Spam"
        assert result["urgency"] == "Low"
    
    def test_general_category(self):
        """Test general inquiries are categorized correctly."""
        result = _fallback_analysis("How do I use the new feature you just released?")
        
        assert result["category"] == "General"
        assert result["urgency"] == "Low"
    
    def test_sentiment_negative(self):
        """Test negative sentiment detection."""
        result = _fallback_analysis("I'm so frustrated and angry with this terrible service")
        
        assert result["sentiment_score"] == 3
    
    def test_sentiment_positive(self):
        """Test positive sentiment (neutral content)."""
        result = _fallback_analysis("I have a question about my account")
        
        assert result["sentiment_score"] == 7
    
    def test_draft_response_includes_category(self):
        """Test that draft response mentions the category."""
        result = _fallback_analysis("My app crashed")
        
        assert "technical" in result["draft_response"].lower()
        assert len(result["draft_response"]) > 20
